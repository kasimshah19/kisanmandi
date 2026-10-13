package com.kisanmandi.controller;

import com.kisanmandi.dto.PublicFarmerResponse;
import com.kisanmandi.service.FarmerProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Public Farmers", description = "Public farmer directory and farm profiles")
@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class PublicFarmerController {

    private final FarmerProfileService farmerProfileService;

    @Operation(summary = "Get public farm profile and rating summary for a farmer")
    @GetMapping("/{id}")
    public ResponseEntity<PublicFarmerResponse> getFarmerProfile(@PathVariable Long id) {
        return ResponseEntity.ok(farmerProfileService.getPublicFarmerProfile(id));
    }
}
