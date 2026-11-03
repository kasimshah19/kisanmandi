package com.kisanmandi.service;

import com.kisanmandi.util.LogScrubberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LoggingEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(LoggingEmailService.class);

    private final AppMetricsService appMetricsService;
    private final boolean logLinks;
    private final boolean emailEnabled;

    public LoggingEmailService(AppMetricsService appMetricsService, boolean logLinks, boolean emailEnabled) {
        this.appMetricsService = appMetricsService;
        this.logLinks = logLinks;
        this.emailEnabled = emailEnabled;
    }

    @Override
    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    @Override
    public void sendEmailVerification(String toEmail, String recipientName, String verificationLink, String lang) {
        String masked = LogScrubberUtil.maskEmail(toEmail);
        if (logLinks) {
            log.info("[EMAIL DEV/LOG] Verification link for {} (lang={}): {}", masked, lang, verificationLink);
        } else {
            log.info("[EMAIL DEV/LOG] Verification requested for {} (lang={})", masked, lang);
        }
        appMetricsService.incrementEmailSent("degraded");
    }

    @Override
    public void sendPasswordReset(String toEmail, String recipientName, String resetLink, String lang) {
        String masked = LogScrubberUtil.maskEmail(toEmail);
        if (logLinks) {
            log.info("[EMAIL DEV/LOG] Password reset link for {} (lang={}): {}", masked, lang, resetLink);
        } else {
            log.info("[EMAIL DEV/LOG] Password reset requested for {} (lang={})", masked, lang);
        }
        appMetricsService.incrementEmailSent("degraded");
    }

    @Override
    public void sendPasswordChanged(String toEmail, String recipientName, String lang) {
        String masked = LogScrubberUtil.maskEmail(toEmail);
        log.info("[EMAIL DEV/LOG] Password changed security notice sent to {} (lang={})", masked, lang);
        appMetricsService.incrementEmailSent("degraded");
    }
}

