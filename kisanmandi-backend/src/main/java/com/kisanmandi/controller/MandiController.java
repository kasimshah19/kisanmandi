package com.kisanmandi.controller;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.mandi.*;
import com.kisanmandi.service.MandiQueryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Tag(name = "Mandi Rates", description = "APMC daily market rates and price trends")
@RestController
@RequestMapping("/api/mandi")
public class MandiController {

    private final MandiQueryService queryService;

    public MandiController(MandiQueryService queryService) {
        this.queryService = queryService;
    }

    private static final CacheControl CACHE_5_MINUTES = CacheControl.maxAge(300, TimeUnit.SECONDS).cachePublic();

    @Operation(summary = "Get list of available states with Mandi data")
    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates() {
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getStates());
    }

    @Operation(summary = "Get districts for a given state")
    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts(@RequestParam(required = true) String state) {
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State is required");
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getDistricts(state));
    }

    @Operation(summary = "Get APMC markets for a state and district")
    @GetMapping("/markets")
    public ResponseEntity<List<String>> getMarkets(
            @RequestParam(required = true) String state,
            @RequestParam(required = true) String district) {
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State is required");
        if (district == null || district.isBlank()) throw new IllegalArgumentException("District is required");
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getMarkets(state, district));
    }

    @Operation(summary = "Get available commodities with optional filters")
    @GetMapping("/commodities")
    public ResponseEntity<List<String>> getCommodities(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market) {
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getCommodities(state, district, market));
    }

    @Operation(summary = "Get latest recorded Mandi price date")
    @GetMapping("/latest-date")
    public ResponseEntity<Map<String, LocalDate>> getLatestDate() {
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(Map.of("latestDate", queryService.getLatestDate()));
    }

    @Operation(summary = "Search and filter daily Mandi prices")
    @GetMapping("/prices")
    public ResponseEntity<PageResponse<MandiPriceResponse>> getPrices(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) String commodity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getPrices(state, district, market, commodity, date, page, size));
    }

    @Operation(summary = "Get price trend for a commodity over N days")
    @GetMapping("/trend")
    public ResponseEntity<TrendResponse> getTrend(
            @RequestParam(required = true) String commodity,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market,
            @RequestParam(defaultValue = "7") int days) {
        if (commodity == null || commodity.isBlank()) throw new IllegalArgumentException("Commodity is required");
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getTrend(commodity, state, district, market, days));
    }

    @Operation(summary = "Compare market prices for a commodity")
    @GetMapping("/compare")
    public ResponseEntity<CompareResponse> getCompare(
            @RequestParam(required = true) String commodity,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "10") int limit) {
        if (commodity == null || commodity.isBlank()) throw new IllegalArgumentException("Commodity is required");
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(queryService.getCompare(commodity, state, district, date, limit));
    }

    @Operation(summary = "Get summary statistics for a commodity")
    @GetMapping("/summary")
    public ResponseEntity<CommoditySummaryResponse> getSummary(
            @RequestParam(required = true) String commodity,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district) {
        if (commodity == null || commodity.isBlank()) throw new IllegalArgumentException("Commodity is required");
        
        CommoditySummaryResponse response = queryService.getSummary(commodity, state, district);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok().cacheControl(CACHE_5_MINUTES).body(response);
    }

    @Operation(summary = "Get Mandi sync and data status")
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        MandiStatusResponse fullStatus = queryService.getStatus();
        return ResponseEntity.ok(Map.of(
                "latestPriceDate", fullStatus.getLatestPriceDate() != null ? fullStatus.getLatestPriceDate().toString() : null,
                "lastSyncTime", fullStatus.getLastSync() != null ? fullStatus.getLastSync().getStartedAt() : null,
                "running", fullStatus.isRunning()
        ));
    }
}
