package com.kisanmandi.controller;

import com.kisanmandi.dto.CreatePaymentOrderRequest;
import com.kisanmandi.dto.PaymentOrderResponse;
import com.kisanmandi.dto.PaymentVerificationRequest;
import com.kisanmandi.dto.PaymentVerificationResponse;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Payment", description = "Legacy payment verification alias")
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @Operation(summary = "Create payment order (legacy route)")
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createPaymentOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.createOrderLegacy(userId, request.getOrderId()));
    }

    @Operation(summary = "Verify Razorpay payment signature (legacy route)")
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.verifyPayment(userId, request));
    }
}
