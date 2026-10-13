package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerStatsResponse;
import com.kisanmandi.service.FarmerStatsService;
import com.kisanmandi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Farmer Stats", description = "Farmer revenue, product, and sales performance statistics")
@RestController
@RequestMapping("/api/farmer/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerStatsController {

    private final FarmerStatsService farmerStatsService;
    private final AuthService authService;

    @Operation(summary = "Get overview dashboard stats for the authenticated farmer")
    @GetMapping
    public ResponseEntity<FarmerStatsResponse> getStats() {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(farmerStatsService.getStats(farmerId));
    }
}
