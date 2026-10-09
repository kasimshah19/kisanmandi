package com.kisanmandi.scheduler;

import com.kisanmandi.entity.SyncTrigger;
import com.kisanmandi.service.MandiSyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class MandiScheduler {

    private static final Logger log = LoggerFactory.getLogger(MandiScheduler.class);
    private final MandiSyncService syncService;

    public MandiScheduler(MandiSyncService syncService) {
        this.syncService = syncService;
    }

    @Scheduled(cron = "${mandi.sync.cron}", zone = "${mandi.sync.zone}")
    public void scheduleMandiSync() {
        log.info("Starting scheduled Mandi API sync");
        try {
            syncService.runSync(SyncTrigger.SCHEDULED);
        } catch (com.kisanmandi.exception.SyncAlreadyRunningException e) {
            log.info("Scheduled sync skipped: already running");
        } catch (Exception e) {
            log.error("Scheduled sync failed", e);
        }
    }
}
