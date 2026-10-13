package com.kisanmandi.controller;

import com.kisanmandi.dto.OrderCountsResponse;
import com.kisanmandi.dto.OrderResponse;
import com.kisanmandi.dto.OrderStatusUpdateRequest;
import com.kisanmandi.dto.OrderSummaryResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.FarmerOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Farmer Orders", description = "Farmer incoming order processing and status workflow")
@RestController
@RequestMapping("/api/farmer/orders")
@RequiredArgsConstructor
public class FarmerOrderController {

    private final FarmerOrderService farmerOrderService;
    private final AuthService authService;

    @Operation(summary = "Get farmer's received orders with pagination and status filter")
    @GetMapping
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(farmerOrderService.list(authService.getCurrentUser().getId(), status, page, size));
    }

    @Operation(summary = "Get order counts grouped by status")
    @GetMapping("/summary")
    public ResponseEntity<OrderCountsResponse> getOrderSummary() {
        return ResponseEntity.ok(farmerOrderService.counts(authService.getCurrentUser().getId()));
    }

    @Operation(summary = "Get detailed information of a specific incoming order")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(farmerOrderService.get(authService.getCurrentUser().getId(), id));
    }

    @Operation(summary = "Update order status (ACCEPT, REJECT, DISPATCH, DELIVER)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        farmerOrderService.updateStatus(authService.getCurrentUser().getId(), id, request);
        return ResponseEntity.ok().build();
    }
}
