package com.kisanmandi.controller;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.mandi.MandiStatusResponse;
import com.kisanmandi.dto.mandi.SyncLogResponse;
import com.kisanmandi.entity.SyncTrigger;
import com.kisanmandi.service.MandiQueryService;
import com.kisanmandi.service.MandiSyncService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/mandi")
public class AdminMandiController {

    private final MandiQueryService queryService;
    private final MandiSyncService syncService;

    public AdminMandiController(MandiQueryService queryService, MandiSyncService syncService) {
        this.queryService = queryService;
        this.syncService = syncService;
    }

    @GetMapping("/status")
    public ResponseEntity<MandiStatusResponse> getStatus() {
        return ResponseEntity.ok(queryService.getStatus());
    }

    @GetMapping("/sync-logs")
    public ResponseEntity<PageResponse<SyncLogResponse>> getSyncLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(queryService.getSyncLogs(page, size));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> triggerSync() {
        syncService.triggerAsync(SyncTrigger.MANUAL);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Sync started"));
    }
}
