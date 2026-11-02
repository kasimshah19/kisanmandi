package com.kisanmandi.service;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;

class EmailServiceTest {

    private EmailService emailService;
    private AppMetricsService appMetricsService;
    private SimpleMeterRegistry meterRegistry;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        appMetricsService = new AppMetricsService(meterRegistry);
        emailService = new EmailService(appMetricsService);
        ReflectionTestUtils.setField(emailService, "mailEnabled", false);
        ReflectionTestUtils.setField(emailService, "mailFrom", "no-reply@kisanmandi.com");
    }

    @Test
    @DisplayName("sendPasswordResetEmail in degraded mode records degraded metric without throwing")
    void testSendPasswordResetDegraded() {
        emailService.sendPasswordResetEmail("kasim@test.com", "http://localhost:5173/reset-password?token=123");

        double degradedCount = meterRegistry.get("email_sent_total")
                .tag("result", "degraded")
                .counter()
                .count();

        assertEquals(1.0, degradedCount);
    }

    @Test
    @DisplayName("sendEmailVerificationEmail in degraded mode records degraded metric")
    void testSendEmailVerificationDegraded() {
        emailService.sendEmailVerificationEmail("farmer@test.com", "http://localhost:5173/verify?token=abc");

        double degradedCount = meterRegistry.get("email_sent_total")
                .tag("result", "degraded")
                .counter()
                .count();

        assertEquals(1.0, degradedCount);
    }
}

