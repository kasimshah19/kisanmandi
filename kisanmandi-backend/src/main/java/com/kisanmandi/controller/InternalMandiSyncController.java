package com.kisanmandi.controller;

import com.kisanmandi.entity.SyncTrigger;
import com.kisanmandi.service.MandiSyncService;
import io.swagger.v3.oas.annotations.Hidden;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;

// Internal endpoint triggered by external cron services (e.g. GitHub Actions)
@Hidden
@RestController
@RequestMapping("/api/internal/mandi")
public class InternalMandiSyncController {

    private static final Logger log = LoggerFactory.getLogger(InternalMandiSyncController.class);

    private final MandiSyncService mandiSyncService;

    @Value("${mandi.cron.token:}")
    private String configuredCronToken;

    public InternalMandiSyncController(MandiSyncService mandiSyncService) {
        this.mandiSyncService = mandiSyncService;
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> triggerSync(
            @RequestHeader(value = "X-Cron-Token", required = false) String tokenHeader,
            HttpServletRequest request) {

        // If cron token property is empty or disabled, return 404
        if (configuredCronToken == null || configuredCronToken.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Internal cron sync endpoint is disabled"));
        }

        // Validate token using constant-time comparison
        boolean isMatch = false;
        if (tokenHeader != null) {
            byte[] providedBytes = tokenHeader.getBytes(StandardCharsets.UTF_8);
            byte[] expectedBytes = configuredCronToken.getBytes(StandardCharsets.UTF_8);
            isMatch = MessageDigest.isEqual(providedBytes, expectedBytes);
        }

        if (!isMatch) {
            String clientIp = request.getHeader("X-Forwarded-For");
            if (clientIp == null || clientIp.isBlank()) {
                clientIp = request.getRemoteAddr();
            }
            log.warn("Unauthorized attempt to trigger internal Mandi sync from IP: {}", clientIp);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Forbidden"));
        }

        // Trigger async sync with SCHEDULED trigger
        mandiSyncService.triggerAsync(SyncTrigger.SCHEDULED);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Mandi sync triggered successfully"));
    }
}
