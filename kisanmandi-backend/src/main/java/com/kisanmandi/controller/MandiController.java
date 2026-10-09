package com.kisanmandi.controller;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.mandi.*;
import com.kisanmandi.service.MandiQueryService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mandi")
public class MandiController {

    private final MandiQueryService queryService;

    public MandiController(MandiQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getStates() {
        return ResponseEntity.ok(queryService.getStates());
    }

    @GetMapping("/districts")
    public ResponseEntity<List<String>> getDistricts(@RequestParam(required = true) String state) {
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State is required");
        return ResponseEntity.ok(queryService.getDistricts(state));
    }

    @GetMapping("/markets")
    public ResponseEntity<List<String>> getMarkets(
            @RequestParam(required = true) String state,
            @RequestParam(required = true) String district) {
        if (state == null || state.isBlank()) throw new IllegalArgumentException("State is required");
        if (district == null || district.isBlank()) throw new IllegalArgumentException("District is required");
        return ResponseEntity.ok(queryService.getMarkets(state, district));
    }

    @GetMapping("/commodities")
    public ResponseEntity<List<String>> getCommodities(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market) {
        return ResponseEntity.ok(queryService.getCommodities(state, district, market));
    }

    @GetMapping("/latest-date")
    public ResponseEntity<Map<String, LocalDate>> getLatestDate() {
        return ResponseEntity.ok(Map.of("latestDate", queryService.getLatestDate()));
    }

    @GetMapping("/prices")
    public ResponseEntity<PageResponse<MandiPriceResponse>> getPrices(
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market,
            @RequestParam(required = false) String commodity,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(queryService.getPrices(state, district, market, commodity, date, page, size));
    }

    @GetMapping("/trend")
    public ResponseEntity<TrendResponse> getTrend(
            @RequestParam(required = true) String commodity,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String market,
            @RequestParam(defaultValue = "7") int days) {
        if (commodity == null || commodity.isBlank()) throw new IllegalArgumentException("Commodity is required");
        return ResponseEntity.ok(queryService.getTrend(commodity, state, district, market, days));
    }

    @GetMapping("/compare")
    public ResponseEntity<CompareResponse> getCompare(
            @RequestParam(required = true) String commodity,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "10") int limit) {
        if (commodity == null || commodity.isBlank()) throw new IllegalArgumentException("Commodity is required");
        return ResponseEntity.ok(queryService.getCompare(commodity, state, district, date, limit));
    }

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
        return ResponseEntity.ok(response);
    }

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
