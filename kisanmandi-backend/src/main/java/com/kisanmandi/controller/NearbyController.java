package com.kisanmandi.controller;

import com.kisanmandi.dto.NearbyFarmerResponse;
import com.kisanmandi.service.NearbyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Nearby Farmers", description = "Geospatial proximity search for local farmers")
@RestController
@RequestMapping("/api/nearby")
@RequiredArgsConstructor
public class NearbyController {

    private final NearbyService nearbyService;

    @Operation(summary = "Find registered farmers within a given radius (km) using Haversine formula")
    @GetMapping("/farmers")
    public ResponseEntity<List<NearbyFarmerResponse>> findNearbyFarmers(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "25") double radiusKm) {
        return ResponseEntity.ok(nearbyService.findNearbyFarmers(lat, lng, radiusKm));
    }
}
