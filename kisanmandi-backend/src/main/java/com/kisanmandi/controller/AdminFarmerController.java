package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerProfileResponse;
import com.kisanmandi.dto.RejectRequest;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.service.AdminFarmerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/farmers")
@RequiredArgsConstructor
public class AdminFarmerController {

    private final AdminFarmerService adminFarmerService;

    @GetMapping
    public ResponseEntity<List<FarmerProfileResponse>> getFarmers(@RequestParam(required = false) ApprovalStatus status) {
        return ResponseEntity.ok(adminFarmerService.listFarmers(status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FarmerProfileResponse> getFarmer(@PathVariable Long id) {
        return ResponseEntity.ok(adminFarmerService.getFarmer(id));
    }

    @PatchMapping("/{id}/approve")
    public ResponseEntity<Void> approveFarmer(@PathVariable Long id) {
        adminFarmerService.approve(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<Void> rejectFarmer(@PathVariable Long id, @Valid @RequestBody RejectRequest request) {
        adminFarmerService.reject(id, request.getReason());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/document-url")
    public ResponseEntity<Map<String, String>> getDocumentUrl(@PathVariable Long id) {
        return ResponseEntity.ok(adminFarmerService.getDocumentUrl(id));
    }
}
