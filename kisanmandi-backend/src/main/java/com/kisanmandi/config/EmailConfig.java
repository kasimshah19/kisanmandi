package com.kisanmandi.config;

import com.kisanmandi.service.AppMetricsService;
import com.kisanmandi.service.BrevoEmailService;
import com.kisanmandi.service.EmailService;
import com.kisanmandi.service.LoggingEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class EmailConfig {

    private static final Logger log = LoggerFactory.getLogger(EmailConfig.class);

    @Value("${app.mail.provider:log}")
    private String provider;

    @Value("${app.mail.brevo.api-key:}")
    private String brevoApiKey;

    @Value("${app.mail.from-email:noreply@kisanmandi.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:KisanMandi}")
    private String fromName;

    @Value("${app.mail.log-links:false}")
    private boolean logLinks;

    @Value("${app.mail.enabled:true}")
    private boolean emailEnabled;

    @Bean
    @Primary
    public EmailService emailService(WebClient.Builder webClientBuilder, AppMetricsService appMetricsService) {
        LoggingEmailService loggingService = new LoggingEmailService(appMetricsService, logLinks, emailEnabled);

        if ("brevo".equalsIgnoreCase(provider)) {
            if (brevoApiKey == null || brevoApiKey.isBlank()) {
                log.warn("app.mail.provider=brevo configured but BREVO_API_KEY is missing or blank; falling back to LoggingEmailService");
                return loggingService;
            }
            log.info("Configured BrevoEmailService with sender {} <{}>", fromName, fromEmail);
            return new BrevoEmailService(webClientBuilder, appMetricsService, loggingService, brevoApiKey, fromEmail, fromName);
        }

        log.info("Configured LoggingEmailService (logLinks={}, emailEnabled={})", logLinks, emailEnabled);
        return loggingService;
    }
}

