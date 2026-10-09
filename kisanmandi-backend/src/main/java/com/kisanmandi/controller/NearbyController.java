package com.kisanmandi.controller;

import com.kisanmandi.dto.NearbyFarmerResponse;
import com.kisanmandi.service.NearbyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nearby")
@RequiredArgsConstructor
public class NearbyController {

    private final NearbyService nearbyService;

    @GetMapping("/farmers")
    public ResponseEntity<List<NearbyFarmerResponse>> findNearbyFarmers(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "50") double radiusKm) {
        return ResponseEntity.ok(nearbyService.findNearbyFarmers(lat, lng, radiusKm));
    }
}
