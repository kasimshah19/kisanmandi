package com.kisanmandi.controller;

import com.kisanmandi.dto.AdminStatsResponse;
import com.kisanmandi.dto.BlockRequest;
import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.HideRequest;
import com.kisanmandi.dto.OrderResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.ProductResponse;
import com.kisanmandi.dto.ReviewResponse;
import com.kisanmandi.dto.UserResponse;
import com.kisanmandi.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    @Operation(summary = "Get paginated users for admin management")
    @GetMapping("/users")
    public ResponseEntity<PageResponse<UserResponse>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getUsers(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @Operation(summary = "Update user status (activate / deactivate)")
    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<Void> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Object> body) {
        boolean active = Boolean.TRUE.equals(body.get("active"));
        if (active) {
            adminService.unblockUser(userId);
        } else {
            String reason = body.get("reason") != null ? body.get("reason").toString() : "Deactivated by admin";
            adminService.blockUser(userId, new BlockRequest(reason));
        }
        return ResponseEntity.ok().build();
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

    @Operation(summary = "Get paginated products for admin management")
    @GetMapping("/products")
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getProducts(PageRequest.of(page, size, Sort.by("createdAt").descending())));
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

    @Operation(summary = "Get paginated orders for admin management")
    @GetMapping("/orders")
    public ResponseEntity<PageResponse<OrderResponse>> getOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getOrders(PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @Operation(summary = "Cancel an order as admin and return product stock")
    @PostMapping("/orders/{orderId}/cancel")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId, @RequestBody(required = false) CancelRequest request) {
        adminService.cancelOrder(orderId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Get paginated reviews for admin management")
    @GetMapping("/reviews")
    public ResponseEntity<PageResponse<ReviewResponse>> getReviews(
            @RequestParam(required = false) Boolean hidden,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) Long farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(adminService.getReviews(hidden, rating, farmerId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
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
