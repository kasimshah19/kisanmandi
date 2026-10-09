package com.kisanmandi.controller;

import com.kisanmandi.dto.AdminStatsResponse;
import com.kisanmandi.dto.BlockRequest;
import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.HideRequest;
import com.kisanmandi.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @PostMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId, @RequestBody(required = false) BlockRequest request) {
        adminService.blockUser(userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        adminService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/products/{productId}/hide")
    public ResponseEntity<Void> hideProduct(@PathVariable Long productId, @RequestBody(required = false) HideRequest request) {
        adminService.hideProduct(productId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/products/{productId}/unhide")
    public ResponseEntity<Void> unhideProduct(@PathVariable Long productId) {
        adminService.unhideProduct(productId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId, @RequestBody(required = false) CancelRequest request) {
        adminService.cancelOrder(orderId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews/{reviewId}/hide")
    public ResponseEntity<Void> hideReview(@PathVariable Long reviewId, @RequestBody(required = false) HideRequest request) {
        adminService.hideReview(reviewId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reviews/{reviewId}/unhide")
    public ResponseEntity<Void> unhideReview(@PathVariable Long reviewId) {
        adminService.unhideReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
