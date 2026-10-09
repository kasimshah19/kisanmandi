package com.kisanmandi.service;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.mandi.*;
import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.entity.MandiSyncLog;
import com.kisanmandi.entity.PriceSource;
import com.kisanmandi.repository.MandiPriceRepository;
import com.kisanmandi.repository.MandiSyncLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class MandiQueryService {

    private final MandiPriceRepository priceRepository;
    private final MandiSyncLogRepository logRepository;

    public MandiQueryService(MandiPriceRepository priceRepository, MandiSyncLogRepository logRepository) {
        this.priceRepository = priceRepository;
        this.logRepository = logRepository;
    }

    public List<String> getStates() {
        return priceRepository.findDistinctStates();
    }

    public List<String> getDistricts(String state) {
        return priceRepository.findDistinctDistricts(state);
    }

    public List<String> getMarkets(String state, String district) {
        return priceRepository.findDistinctMarkets(state, district);
    }

    public List<String> getCommodities(String state, String district, String market) {
        return priceRepository.findDistinctCommodities(state, district, market);
    }

    public LocalDate getLatestDate() {
        return priceRepository.findLatestPriceDate().orElse(LocalDate.now());
    }

    public PageResponse<MandiPriceResponse> getPrices(String state, String district, String market, String commodity, LocalDate date, int page, int size) {
        if (date == null) date = getLatestDate();
        if (size > 100) size = 100;

        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<MandiPrice> prices = priceRepository.findPrices(state, district, market, commodity, date, pageable);

        return new PageResponse<>(
                prices.getContent().stream().map(this::mapToResponse).toList(),
                prices.getNumber(),
                prices.getSize(),
                prices.getTotalElements(),
                prices.getTotalPages()
        );
    }

    public TrendResponse getTrend(String commodity, String state, String district, String market, int days) {
        if (days < 1) days = 7;
        if (days > 90) days = 90;

        LocalDate endDate = priceRepository.findLatestPriceDateByCommodity(commodity).orElse(LocalDate.now());
        LocalDate startDate = endDate.minusDays(days - 1);

        List<TrendPoint> points = priceRepository.getTrend(commodity, state, district, market, startDate, endDate);
        
        // Demo flag logic
        boolean hasDemoData = priceRepository.countBySource(PriceSource.DEMO) > 0;

        return TrendResponse.builder()
                .commodity(commodity)
                .days(days)
                .points(points)
                .hasDemoData(hasDemoData)
                .build();
    }

    public CompareResponse getCompare(String commodity, String state, String district, LocalDate date, int limit) {
        if (date == null) date = priceRepository.findLatestPriceDateByCommodity(commodity).orElse(LocalDate.now());
        if (limit > 20) limit = 20;

        Pageable pageable = PageRequest.of(0, limit);
        List<ComparePoint> points = priceRepository.getCompare(commodity, state, district, date, pageable);

        return CompareResponse.builder()
                .commodity(commodity)
                .date(date)
                .points(points)
                .build();
    }

    public CommoditySummaryResponse getSummary(String commodityName, String state, String district) {
        List<String> exactMatch = priceRepository.findCommodityExact(commodityName);
        String commodity = exactMatch.isEmpty() ? 
            priceRepository.searchCommoditiesFuzzy(commodityName).stream().findFirst().orElse(null) : 
            exactMatch.get(0);

        if (commodity == null) {
            return null; // Signals empty/204
        }

        LocalDate latestDate = priceRepository.findLatestPriceDateByCommodity(commodity).orElse(null);
        if (latestDate == null) return null;

        // Try District
        Optional<TrendPoint> summary = priceRepository.getSummary(commodity, state, district, latestDate);
        String scopeUsed = "DISTRICT";

        // Try State
        if (summary.isEmpty() && state != null) {
            summary = priceRepository.getSummary(commodity, state, null, latestDate);
            scopeUsed = "STATE";
        }

        // Try All
        if (summary.isEmpty()) {
            summary = priceRepository.getSummary(commodity, null, null, latestDate);
            scopeUsed = "ALL";
        }

        if (summary.isEmpty()) return null;

        TrendPoint p = summary.get();

        // Find previous date
        LocalDate prevDate = latestDate.minusDays(1);
        // Quick lookup for previous date with same scope
        Optional<TrendPoint> prevSummary = priceRepository.getSummary(commodity, 
                scopeUsed.equals("DISTRICT") || scopeUsed.equals("STATE") ? state : null, 
                scopeUsed.equals("DISTRICT") ? district : null, prevDate);

        BigDecimal prevAvg = prevSummary.map(t -> t.getAvgModal()).orElse(null);
        BigDecimal changePercent = null;

        if (prevAvg != null && prevAvg.compareTo(BigDecimal.ZERO) > 0 && p.getAvgModal() != null) {
            changePercent = p.getAvgModal().subtract(prevAvg)
                    .divide(prevAvg, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"));
        }

        return CommoditySummaryResponse.builder()
                .commodity(commodity)
                .priceDate(latestDate)
                .avgModal(p.getAvgModal())
                .minPrice(p.getMinPrice())
                .maxPrice(p.getMaxPrice())
                .marketCount(p.getMarketCount())
                .previousAvgModal(prevAvg)
                .changePercent(changePercent)
                .scopeUsed(scopeUsed)
                .build();
    }

    public MandiStatusResponse getStatus() {
        LocalDate latest = getLatestDate();
        long totalRows = priceRepository.count();
        Optional<MandiSyncLog> lastSyncOpt = logRepository.findFirstByOrderByStartedAtDesc();
        boolean running = lastSyncOpt.map(l -> l.getStatus() == com.kisanmandi.entity.SyncStatus.RUNNING).orElse(false);

        return MandiStatusResponse.builder()
                .latestPriceDate(latest)
                .totalRows(totalRows)
                .lastSync(lastSyncOpt.map(this::mapToLogResponse).orElse(null))
                .running(running)
                .build();
    }

    public PageResponse<SyncLogResponse> getSyncLogs(int page, int size) {
        Page<MandiSyncLog> logs = logRepository.findAllByOrderByStartedAtDesc(PageRequest.of(page, size));
        return new PageResponse<>(
                logs.getContent().stream().map(this::mapToLogResponse).toList(),
                logs.getNumber(),
                logs.getSize(),
                logs.getTotalElements(),
                logs.getTotalPages()
        );
    }

    private MandiPriceResponse mapToResponse(MandiPrice p) {
        return MandiPriceResponse.builder()
                .state(p.getState())
                .district(p.getDistrict())
                .market(p.getMarket())
                .commodity(p.getCommodity())
                .variety(p.getVariety())
                .grade(p.getGrade())
                .minPrice(p.getMinPrice())
                .maxPrice(p.getMaxPrice())
                .modalPrice(p.getModalPrice())
                .priceDate(p.getPriceDate())
                .source(p.getSource())
                .build();
    }

    private SyncLogResponse mapToLogResponse(MandiSyncLog l) {
        return SyncLogResponse.builder()
                .id(l.getId())
                .startedAt(l.getStartedAt())
                .finishedAt(l.getFinishedAt())
                .status(l.getStatus())
                .triggerSource(l.getTriggerSource())
                .recordsFetched(l.getRecordsFetched())
                .recordsInserted(l.getRecordsInserted())
                .recordsUpdated(l.getRecordsUpdated())
                .recordsSkipped(l.getRecordsSkipped())
                .durationMs(l.getDurationMs())
                .errorMessage(l.getErrorMessage())
                .details(l.getDetails())
                .build();
    }
}
