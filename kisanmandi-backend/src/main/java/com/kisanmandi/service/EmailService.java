package com.kisanmandi.service;

import com.kisanmandi.util.LogScrubberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final AppMetricsService appMetricsService;

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@kisanmandi.com}")
    private String mailFrom;

    public EmailService(AppMetricsService appMetricsService) {
        this.appMetricsService = appMetricsService;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String maskedEmail = LogScrubberUtil.maskEmail(toEmail);
        if (!mailEnabled) {
            log.info("[EMAIL DEGRADED/DEV] Password reset requested for {}. Reset link: {}", maskedEmail, resetLink);
            appMetricsService.incrementEmailSent("degraded");
            return;
        }
        try {
            log.info("Sending password reset email to {} from {}", maskedEmail, mailFrom);
            appMetricsService.incrementEmailSent("success");
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", maskedEmail, e.getMessage());
            appMetricsService.incrementEmailSent("failure");
        }
    }

    public void sendEmailVerificationEmail(String toEmail, String verificationLink) {
        String maskedEmail = LogScrubberUtil.maskEmail(toEmail);
        if (!mailEnabled) {
            log.info("[EMAIL DEGRADED/DEV] Verification requested for {}. Verification link: {}", maskedEmail, verificationLink);
            appMetricsService.incrementEmailSent("degraded");
            return;
        }
        try {
            log.info("Sending email verification to {} from {}", maskedEmail, mailFrom);
            appMetricsService.incrementEmailSent("success");
        } catch (Exception e) {
            log.error("Failed to send email verification to {}: {}", maskedEmail, e.getMessage());
            appMetricsService.incrementEmailSent("failure");
        }
    }
}
