package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerStatsResponse;
import com.kisanmandi.service.FarmerStatsService;
import com.kisanmandi.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/farmer/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerStatsController {

    private final FarmerStatsService farmerStatsService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<FarmerStatsResponse> getStats() {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(farmerStatsService.getStats(farmerId));
    }
}
