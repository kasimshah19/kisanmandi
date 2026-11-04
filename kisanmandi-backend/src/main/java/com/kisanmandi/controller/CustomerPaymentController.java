package com.kisanmandi.controller;

import com.kisanmandi.dto.CheckoutPaymentDetails;
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

@Tag(name = "Customer Payments", description = "Customer online payment verification and retry")
@RestController
@RequestMapping("/api/customer/payments")
@RequiredArgsConstructor
public class CustomerPaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;

    @Operation(summary = "Verify Razorpay payment signature after client payment completion")
    @PostMapping("/verify")
    public ResponseEntity<PaymentVerificationResponse> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.verifyPayment(userId, request));
    }

    @Operation(summary = "Retry payment for an awaiting payment group before expiry")
    @PostMapping("/{paymentGroupId}/retry")
    public ResponseEntity<CheckoutPaymentDetails> retryPayment(@PathVariable String paymentGroupId) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(paymentService.retryPayment(userId, paymentGroupId));
    }

    @Operation(summary = "Cancel an awaiting payment group before expiry")
    @PostMapping("/{paymentGroupId}/cancel")
    public ResponseEntity<Void> cancelPaymentGroup(@PathVariable String paymentGroupId) {
        paymentService.cancelPaymentGroup(paymentGroupId, "Customer cancelled before payment completion");
        return ResponseEntity.noContent().build();
    }
}
