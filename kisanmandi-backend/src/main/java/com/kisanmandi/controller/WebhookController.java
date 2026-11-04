package com.kisanmandi.controller;

import com.kisanmandi.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@Tag(name = "Payment Webhook", description = "Server-to-server webhook endpoint for Razorpay")
@RestController
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentService paymentService;

    @Operation(summary = "Razorpay server-to-server webhook")
    @PostMapping({"/api/payments/razorpay/webhook", "/api/payment/webhook"})
    public ResponseEntity<Map<String, String>> handleWebhook(
            @RequestBody String rawBody,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestHeader(value = "x-razorpay-event-id", required = false) String eventIdHeader,
            HttpServletRequest request) {

        if (signature == null || signature.isBlank()) {
            signature = request.getHeader("x-razorpay-signature");
        }
        if (eventIdHeader == null || eventIdHeader.isBlank()) {
            eventIdHeader = request.getHeader("X-Razorpay-Event-Id");
        }

        paymentService.processWebhook(rawBody, signature, eventIdHeader);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}

