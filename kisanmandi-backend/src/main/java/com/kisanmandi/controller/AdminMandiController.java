package com.kisanmandi.controller;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.mandi.MandiStatusResponse;
import com.kisanmandi.dto.mandi.SyncLogResponse;
import com.kisanmandi.entity.SyncTrigger;
import com.kisanmandi.service.MandiQueryService;
import com.kisanmandi.service.MandiSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin Mandi", description = "Admin APMC Mandi sync administration and execution logs")
@RestController
@RequestMapping("/api/admin/mandi")
public class AdminMandiController {

    private final MandiQueryService queryService;
    private final MandiSyncService syncService;

    public AdminMandiController(MandiQueryService queryService, MandiSyncService syncService) {
        this.queryService = queryService;
        this.syncService = syncService;
    }

    @Operation(summary = "Get Mandi sync health and last execution status")
    @GetMapping("/status")
    public ResponseEntity<MandiStatusResponse> getStatus() {
        return ResponseEntity.ok(queryService.getStatus());
    }

    @Operation(summary = "Get paginated history of Mandi synchronization logs")
    @GetMapping("/sync-logs")
    public ResponseEntity<PageResponse<SyncLogResponse>> getSyncLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(queryService.getSyncLogs(page, size));
    }

    @Operation(summary = "Trigger manual Mandi data sync immediately")
    @PostMapping("/sync")
    public ResponseEntity<Map<String, String>> triggerSync() {
        syncService.triggerAsync(SyncTrigger.MANUAL);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Sync started"));
    }
}
