package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerProfileRequest;
import com.kisanmandi.dto.FarmerProfileResponse;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.FarmerProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/farmer/profile")
@RequiredArgsConstructor
public class FarmerProfileController {

    private final FarmerProfileService farmerProfileService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<FarmerProfileResponse> getMyProfile() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(farmerProfileService.getMyProfile(userId));
    }

    @RequestMapping(method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<FarmerProfileResponse> saveProfile(@Valid @RequestBody FarmerProfileRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(farmerProfileService.saveProfile(userId, request));
    }

    @PostMapping("/document")
    public ResponseEntity<FarmerProfileResponse> uploadDocument(@RequestParam("file") MultipartFile file) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(farmerProfileService.uploadDocument(userId, file));
    }
}
