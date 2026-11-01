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

import java.util.Map;

@Tag(name = "Payment", description = "Online payments processing and verification")
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @Operation(summary = "Create Razorpay payment order for an existing order")
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.createPaymentOrder(userId, request.getOrderId()));
    }

    @Operation(summary = "Verify Razorpay payment signature after client payment completion")
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.verifyPayment(userId, request));
    }

    @Operation(summary = "Razorpay server-to-server webhook")
    @PostMapping("/webhook")
    public ResponseEntity<Map<String, String>> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.processWebhook(payload, signature);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
