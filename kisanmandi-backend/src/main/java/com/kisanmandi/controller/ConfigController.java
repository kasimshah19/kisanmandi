package com.kisanmandi.controller;

import com.kisanmandi.dto.PublicConfigResponse;
import com.kisanmandi.service.EmailService;
import com.kisanmandi.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Public Config", description = "Public runtime configuration and feature flags")
@RestController
public class ConfigController {

    private final PaymentService paymentService;
    private final EmailService emailService;

    @Value("${app.auth.require-verified-email:false}")
    private boolean requireVerifiedEmail;

    public ConfigController(PaymentService paymentService, EmailService emailService) {
        this.paymentService = paymentService;
        this.emailService = emailService;
    }

    @Operation(summary = "Get public configuration and active feature flags")
    @GetMapping({"/api/config/public", "/api/public/config"})
    public ResponseEntity<PublicConfigResponse> getPublicConfig() {
        boolean onlineEnabled = paymentService.isPaymentEnabled();
        return ResponseEntity.ok(PublicConfigResponse.builder()
                .emailEnabled(emailService.isEmailEnabled())
                .requireVerifiedEmail(requireVerifiedEmail)
                .paymentEnabled(onlineEnabled)
                .onlinePaymentsEnabled(onlineEnabled)
                .razorpayKeyId(onlineEnabled ? paymentService.getKeyId() : "")
                .build());
    }
}
