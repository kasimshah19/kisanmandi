package com.kisanmandi.controller;

import com.kisanmandi.dto.PublicConfigResponse;
import com.kisanmandi.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Public Config", description = "Public runtime configuration and feature flags")
@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    private final PaymentService paymentService;

    @Operation(summary = "Get public configuration and active feature flags")
    @GetMapping("/public")
    public ResponseEntity<PublicConfigResponse> getPublicConfig() {
        return ResponseEntity.ok(PublicConfigResponse.builder()
                .paymentEnabled(paymentService.isPaymentEnabled())
                .razorpayKeyId(paymentService.isPaymentEnabled() ? paymentService.getKeyId() : "")
                .build());
    }
}
