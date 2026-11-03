package com.kisanmandi.service;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class EmailServiceTest {

    private EmailService emailService;
    private AppMetricsService appMetricsService;
    private SimpleMeterRegistry meterRegistry;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        appMetricsService = new AppMetricsService(meterRegistry);
        emailService = new LoggingEmailService(appMetricsService, false, true);
    }

    @Test
    @DisplayName("sendPasswordResetEmail in logging/dev mode records degraded metric without throwing")
    void testSendPasswordResetDegraded() {
        emailService.sendPasswordResetEmail("kasim@test.com", "http://localhost:5173/reset-password#token=123");

        double degradedCount = meterRegistry.get("email_sent_total")
                .tag("result", "degraded")
                .counter()
                .count();

        assertEquals(1.0, degradedCount);
    }

    @Test
    @DisplayName("sendEmailVerificationEmail in logging/dev mode records degraded metric")
    void testSendEmailVerificationDegraded() {
        emailService.sendEmailVerificationEmail("farmer@test.com", "http://localhost:5173/verify-email#token=abc");

        double degradedCount = meterRegistry.get("email_sent_total")
                .tag("result", "degraded")
                .counter()
                .count();

        assertEquals(1.0, degradedCount);
    }

    @Test
    @DisplayName("EmailTemplates generate correct multilingual subjects and escaped names")
    void testEmailTemplates() {
        EmailTemplates.EmailContent enVerify = EmailTemplates.buildVerificationEmail("<script>alert(1)</script> Ramesh", "http://localhost:5173/verify-email#token=xyz", "en");
        assertTrue(enVerify.subject().contains("Verify your email"));
        assertTrue(enVerify.htmlContent().contains("&lt;script&gt;alert(1)&lt;/script&gt; Ramesh"));
        assertTrue(enVerify.htmlContent().contains("verify-email#token=xyz"));

        EmailTemplates.EmailContent hiReset = EmailTemplates.buildPasswordResetEmail("Kishan", "http://localhost:5173/reset-password#token=xyz", "hi");
        assertTrue(hiReset.subject().contains("अपना पासवर्ड रीसेट करें"));
        assertTrue(hiReset.htmlContent().contains("30 मिनट"));

        EmailTemplates.EmailContent mrChanged = EmailTemplates.buildPasswordChangedEmail("Ganesh", "mr");
        assertTrue(mrChanged.subject().contains("सुरक्षा सूचना"));
        assertTrue(mrChanged.htmlContent().contains("Ganesh"));
    }
}
