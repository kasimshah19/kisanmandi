package com.kisanmandi.controller;

import com.kisanmandi.dto.PublicFarmerResponse;
import com.kisanmandi.service.FarmerProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class PublicFarmerController {

    private final FarmerProfileService farmerProfileService;

    @GetMapping("/{id}")
    public ResponseEntity<PublicFarmerResponse> getFarmerProfile(@PathVariable Long id) {
        return ResponseEntity.ok(farmerProfileService.getPublicFarmerProfile(id));
    }
}
