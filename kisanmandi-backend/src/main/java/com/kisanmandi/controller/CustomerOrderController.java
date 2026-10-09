package com.kisanmandi.controller;

import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.CheckoutRequest;
import com.kisanmandi.dto.OrderResponse;
import com.kisanmandi.dto.OrderSummaryResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @PostMapping("/checkout")
    public ResponseEntity<List<OrderSummaryResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request) {
        return new ResponseEntity<>(orderService.checkout(authService.getCurrentUser().getId(), request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<PageResponse<OrderSummaryResponse>> myOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.myOrders(authService.getCurrentUser().getId(), status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(
            @PathVariable Long id) {
        return ResponseEntity.ok(orderService.getMyOrder(authService.getCurrentUser().getId(), id));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelRequest request) {
        orderService.cancel(authService.getCurrentUser().getId(), id, request);
        return ResponseEntity.ok().build();
    }
}
