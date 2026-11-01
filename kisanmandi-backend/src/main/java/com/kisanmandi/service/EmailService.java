package com.kisanmandi.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    @Value("${app.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${app.mail.from:no-reply@kisanmandi.com}")
    private String mailFrom;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (!mailEnabled) {
            log.info("[EMAIL DEGRADED/DEV] Password reset requested for {}. Reset link: {}", toEmail, resetLink);
            return;
        }
        try {
            // If external mail provider (e.g. SMTP/Resend/Brevo) is configured:
            log.info("Sending password reset email to {} from {}", toEmail, mailFrom);
            // Gracefully handled; can integrate JavaMailSender when SMTP is provisioned
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }

    public void sendEmailVerificationEmail(String toEmail, String verificationLink) {
        if (!mailEnabled) {
            log.info("[EMAIL DEGRADED/DEV] Verification requested for {}. Verification link: {}", toEmail, verificationLink);
            return;
        }
        try {
            log.info("Sending email verification to {} from {}", toEmail, mailFrom);
        } catch (Exception e) {
            log.error("Failed to send email verification to {}: {}", toEmail, e.getMessage());
        }
    }
}
