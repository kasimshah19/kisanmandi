package com.kisanmandi.service;

import com.kisanmandi.dto.mandi.MandiApiRecord;
import com.kisanmandi.dto.mandi.MandiApiResponse;
import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.entity.MandiSyncLog;
import com.kisanmandi.entity.PriceSource;
import com.kisanmandi.entity.SyncStatus;
import com.kisanmandi.entity.SyncTrigger;
import com.kisanmandi.exception.SyncAlreadyRunningException;
import com.kisanmandi.repository.MandiPriceRepository;
import com.kisanmandi.repository.MandiSyncLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class MandiSyncService {

    private static final Logger log = LoggerFactory.getLogger(MandiSyncService.class);
    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final MandiApiClient apiClient;
    private final MandiPersistenceService persistenceService;
    private final MandiSyncLogRepository logRepository;
    private final MandiPriceRepository priceRepository;

    @Value("${mandi.sync.states}")
    private String syncStatesStr;

    @Value("${mandi.sync.page-size}")
    private int pageSize;

    @Value("${mandi.sync.max-pages}")
    private int maxPages;

    @Value("${mandi.sync.retention-days}")
    private int retentionDays;

    @Value("${mandi.sync.run-on-startup}")
    private boolean runOnStartup;

    public MandiSyncService(MandiApiClient apiClient, MandiPersistenceService persistenceService, MandiSyncLogRepository logRepository, MandiPriceRepository priceRepository) {
        this.apiClient = apiClient;
        this.persistenceService = persistenceService;
        this.logRepository = logRepository;
        this.priceRepository = priceRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        // Mark leftovers as FAILED
        List<MandiSyncLog> runningLogs = logRepository.findByStatus(SyncStatus.RUNNING);
        for (MandiSyncLog l : runningLogs) {
            l.setStatus(SyncStatus.FAILED);
            l.setErrorMessage("Interrupted by restart");
            l.setFinishedAt(LocalDateTime.now());
            logRepository.save(l);
        }

        if (runOnStartup) {
            boolean dataForToday = priceRepository.existsByPriceDate(LocalDate.now());
            if (!dataForToday) {
                log.info("Starting Mandi sync on startup.");
                triggerAsync(SyncTrigger.STARTUP);
            }
        }
    }

    public void triggerAsync(SyncTrigger trigger) {
        if (!isRunning.compareAndSet(false, true)) {
            throw new SyncAlreadyRunningException("Sync is already running");
        }
        // Run async, release lock inside runSyncInternal
        CompletableFuture.runAsync(() -> runSyncInternal(trigger));
    }

    public void runSync(SyncTrigger trigger) {
        if (!isRunning.compareAndSet(false, true)) {
            throw new SyncAlreadyRunningException("Sync is already running");
        }
        runSyncInternal(trigger);
    }

    @SuppressWarnings("null")
    private void runSyncInternal(SyncTrigger trigger) {
        long startTime = System.currentTimeMillis();
        MandiSyncLog syncLog = MandiSyncLog.builder()
                .status(SyncStatus.RUNNING)
                .triggerSource(trigger)
                .build();
        syncLog = logRepository.save(syncLog);

        List<String> states = Arrays.stream(syncStatesStr.split(",")).map(s -> s.trim()).toList();
        
        int totalFetched = 0, totalInserted = 0, totalUpdated = 0, totalSkipped = 0;
        int successCount = 0;
        StringBuilder details = new StringBuilder();
        String lastError = null;

        try {
            for (String state : states) {
                int stateFetched = 0;
                int offset = 0;
                try {
                    for (int page = 0; page < maxPages; page++) {
                        MandiApiResponse response = apiClient.fetchPage(state, offset, pageSize);
                        if (response == null || response.getRecords() == null || response.getRecords().isEmpty()) {
                            break;
                        }

                        List<MandiPrice> batch = new ArrayList<>();
                        for (MandiApiRecord r : response.getRecords()) {
                            MandiPrice price = parseRecord(r);
                            if (price == null) {
                                totalSkipped++;
                            } else {
                                batch.add(price);
                            }
                        }

                        // Group by date to process batches per date
                        // Usually all records in a response will have same date, but just in case
                        var byDate = batch.stream().collect(java.util.stream.Collectors.groupingBy(p -> p.getPriceDate()));
                        
                        for (var entry : byDate.entrySet()) {
                            MandiPersistenceService.BatchResult res = persistenceService.saveBatch(state, entry.getKey(), entry.getValue());
                            totalInserted += res.inserted;
                            totalUpdated += res.updated;
                        }

                        int count = response.getRecords().size();
                        stateFetched += count;
                        offset += count;

                        if (count < pageSize) {
                            break;
                        }
                    }
                    successCount++;
                    details.append(state).append(": ").append(stateFetched).append(" fetched. ");
                } catch (Exception e) {
                    lastError = "State " + state + " failed: " + e.getMessage();
                    log.error(lastError, e);
                    details.append(state).append(": FAILED. ");
                }
                totalFetched += stateFetched;
            }

            if (successCount == states.size()) {
                syncLog.setStatus(SyncStatus.SUCCESS);
            } else if (successCount > 0) {
                syncLog.setStatus(SyncStatus.PARTIAL);
                syncLog.setErrorMessage(sanitizeError(lastError));
            } else {
                syncLog.setStatus(SyncStatus.FAILED);
                syncLog.setErrorMessage(sanitizeError(lastError != null ? lastError : "All states failed"));
            }

            if (syncLog.getStatus() == SyncStatus.SUCCESS || syncLog.getStatus() == SyncStatus.PARTIAL) {
                cleanUpOldData();
            }

        } catch (Exception e) {
            log.error("Fatal error during sync", e);
            syncLog.setStatus(SyncStatus.FAILED);
            syncLog.setErrorMessage(sanitizeError(e.getMessage()));
        } finally {
            syncLog.setFinishedAt(LocalDateTime.now());
            syncLog.setDurationMs(System.currentTimeMillis() - startTime);
            syncLog.setRecordsFetched(totalFetched);
            syncLog.setRecordsInserted(totalInserted);
            syncLog.setRecordsUpdated(totalUpdated);
            syncLog.setRecordsSkipped(totalSkipped);
            syncLog.setDetails(details.toString());
            logRepository.save(syncLog);
            
            isRunning.set(false);
        }
    }

    private void cleanUpOldData() {
        LocalDate cutoff = LocalDate.now().minusDays(retentionDays);
        try {
            int deleted = priceRepository.deleteByPriceDateBefore(cutoff);
            if (deleted > 0) {
                log.info("Deleted {} old mandi price records before {}", deleted, cutoff);
            }
        } catch (Exception e) {
            log.warn("Failed to delete old data", e);
        }
    }

    private MandiPrice parseRecord(MandiApiRecord r) {
        try {
            LocalDate date;
            try {
                date = LocalDate.parse(r.getArrivalDate(), dateFormatter);
            } catch (DateTimeParseException e) {
                date = LocalDate.parse(r.getArrivalDate()); // Fallback ISO
            }

            BigDecimal modal = parseDecimal(r.getModalPrice());
            if (modal == null || modal.compareTo(BigDecimal.ZERO) <= 0) {
                return null; // Skip invalid or zero modal price
            }

            MandiPrice p = new MandiPrice();
            p.setState(r.getState());
            p.setDistrict(r.getDistrict());
            p.setMarket(r.getMarket());
            p.setCommodity(r.getCommodity());
            p.setVariety(r.getVariety());
            p.setGrade(r.getGrade());
            p.setPriceDate(date);
            p.setMinPrice(parseDecimal(r.getMinPrice()));
            p.setMaxPrice(parseDecimal(r.getMaxPrice()));
            p.setModalPrice(modal);
            p.setSource(PriceSource.API);
            p.normalize();
            
            return p;
        } catch (Exception e) {
            return null; // Skip invalid record
        }
    }

    private BigDecimal parseDecimal(String val) {
        if (val == null || val.trim().isEmpty() || val.equalsIgnoreCase("NA")) return null;
        try {
            return new BigDecimal(val.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String sanitizeError(String err) {
        if (err == null) return null;
        String sanitized = err.length() > 990 ? err.substring(0, 990) : err;
        return sanitized; // The client already masked the api-key
    }
}
