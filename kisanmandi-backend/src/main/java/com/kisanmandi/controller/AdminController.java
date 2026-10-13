package com.kisanmandi.controller;

import com.kisanmandi.dto.AdminStatsResponse;
import com.kisanmandi.dto.BlockRequest;
import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.HideRequest;
import com.kisanmandi.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Admin Operations", description = "Platform statistics, moderation, blocking users, and managing content")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Get overall platform analytics and metrics")
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @Operation(summary = "Block a customer or farmer user account")
    @PostMapping("/users/{userId}/block")
    public ResponseEntity<Void> blockUser(@PathVariable Long userId, @RequestBody(required = false) BlockRequest request) {
        adminService.blockUser(userId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Unblock a customer or farmer user account")
    @PostMapping("/users/{userId}/unblock")
    public ResponseEntity<Void> unblockUser(@PathVariable Long userId) {
        adminService.unblockUser(userId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Hide a product from public view")
    @PostMapping("/products/{productId}/hide")
    public ResponseEntity<Void> hideProduct(@PathVariable Long productId, @RequestBody(required = false) HideRequest request) {
        adminService.hideProduct(productId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Restore visibility of a previously hidden product")
    @PostMapping("/products/{productId}/unhide")
    public ResponseEntity<Void> unhideProduct(@PathVariable Long productId) {
        adminService.unhideProduct(productId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Cancel an order as admin and return product stock")
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId, @RequestBody(required = false) CancelRequest request) {
        adminService.cancelOrder(orderId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Hide an inappropriate customer review")
    @PostMapping("/reviews/{reviewId}/hide")
    public ResponseEntity<Void> hideReview(@PathVariable Long reviewId, @RequestBody(required = false) HideRequest request) {
        adminService.hideReview(reviewId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Unhide a previously hidden review")
    @PostMapping("/reviews/{reviewId}/unhide")
    public ResponseEntity<Void> unhideReview(@PathVariable Long reviewId) {
        adminService.unhideReview(reviewId);
        return ResponseEntity.ok().build();
    }
}
