package com.kisanmandi.controller;

import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.CheckoutRequest;
import com.kisanmandi.dto.OrderResponse;
import com.kisanmandi.dto.OrderSummaryResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Customer Orders", description = "Customer checkout and order tracking")
@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;
    private final AuthService authService;

    @Operation(summary = "Checkout active cart into farmer orders")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orders placed successfully"),
            @ApiResponse(responseCode = "400", description = "Cart empty or invalid address"),
            @ApiResponse(responseCode = "409", description = "Insufficient stock or product unavailable")
    })
    @PostMapping("/checkout")
    public ResponseEntity<List<OrderSummaryResponse>> checkout(
            @Valid @RequestBody CheckoutRequest request) {
        return new ResponseEntity<>(orderService.checkout(authService.getCurrentUser().getId(), request), HttpStatus.CREATED);
    }

    @Operation(summary = "List customer orders with optional status filter")
    @GetMapping
    public ResponseEntity<PageResponse<OrderSummaryResponse>> myOrders(
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.myOrders(authService.getCurrentUser().getId(), status, page, size));
    }

    @Operation(summary = "Get detailed order tracking by ID")
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getMyOrder(authService.getCurrentUser().getId(), id));
    }

    @Operation(summary = "Cancel a PLACED customer order")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelOrder(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) CancelRequest request) {
        orderService.cancel(authService.getCurrentUser().getId(), id, request);
        return ResponseEntity.ok().build();
    }
}
