package com.kisanmandi.controller;

import com.kisanmandi.dto.OrderCountsResponse;
import com.kisanmandi.dto.OrderResponse;
import com.kisanmandi.dto.OrderStatusUpdateRequest;
import com.kisanmandi.dto.OrderSummaryResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.FarmerOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer/orders")
@RequiredArgsConstructor
public class FarmerOrderController {

    private final FarmerOrderService farmerOrderService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<PageResponse<OrderSummaryResponse>> getOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(farmerOrderService.list(authService.getCurrentUser().getId(), status, page, size));
    }

    @GetMapping("/summary")
    public ResponseEntity<OrderCountsResponse> getOrderSummary() {
        return ResponseEntity.ok(farmerOrderService.counts(authService.getCurrentUser().getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id) {
        return ResponseEntity.ok(farmerOrderService.get(authService.getCurrentUser().getId(), id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        farmerOrderService.updateStatus(authService.getCurrentUser().getId(), id, request);
        return ResponseEntity.ok().build();
    }
}
