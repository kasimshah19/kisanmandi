package com.kisanmandi.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.*;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.IdempotencyService;
import com.kisanmandi.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer Orders", description = "Customer checkout and order tracking")
@RestController
@RequestMapping("/api/customer/orders")
@RequiredArgsConstructor
public class CustomerOrderController {

    private final OrderService orderService;
    private final AuthService authService;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @Operation(summary = "Checkout active cart into farmer orders")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Orders placed successfully"),
            @ApiResponse(responseCode = "400", description = "Cart empty or invalid address"),
            @ApiResponse(responseCode = "409", description = "Insufficient stock or duplicate request in-progress"),
            @ApiResponse(responseCode = "422", description = "Idempotency key reused with different payload")
    })
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @Valid @RequestBody CheckoutRequest request,
            HttpServletRequest httpRequest) {

        Long userId = authService.getCurrentUser().getId();
        String rawBody;
        try {
            rawBody = objectMapper.writeValueAsString(request);
        } catch (JsonProcessingException e) {
            rawBody = request.toString();
        }

        String fingerprint = idempotencyService.computeFingerprint(userId, httpRequest.getMethod(), httpRequest.getRequestURI(), rawBody);

        IdempotencyService.CheckResult check = idempotencyService.checkAndLock(userId, idempotencyKey, fingerprint);
        if (check.isReplay()) {
            return ResponseEntity.status(check.getResponseStatus())
                    .header("Idempotent-Replay", "true")
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .body(check.getResponseBody());
        }

        try {
            CheckoutResponse response = orderService.checkout(userId, request);
            String responseJson = objectMapper.writeValueAsString(response);
            idempotencyService.complete(userId, idempotencyKey, HttpStatus.CREATED.value(), responseJson);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            idempotencyService.fail(userId, idempotencyKey);
            throw e;
        } catch (Exception e) {
            idempotencyService.fail(userId, idempotencyKey);
            throw new RuntimeException(e);
        }
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

    @Operation(summary = "Cancel a PLACED or AWAITING_PAYMENT customer order")
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @RequestBody(required = false) CancelRequest request) {
        orderService.cancel(authService.getCurrentUser().getId(), id, request);
        return ResponseEntity.noContent().build();
    }
}
