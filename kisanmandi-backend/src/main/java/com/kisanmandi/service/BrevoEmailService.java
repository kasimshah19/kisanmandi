package com.kisanmandi.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.kisanmandi.util.LogScrubberUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.List;
import java.util.Map;

public class BrevoEmailService implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(BrevoEmailService.class);
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final WebClient webClient;
    private final AppMetricsService appMetricsService;
    private final LoggingEmailService fallbackService;
    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public BrevoEmailService(WebClient.Builder webClientBuilder,
                             AppMetricsService appMetricsService,
                             LoggingEmailService fallbackService,
                             String apiKey,
                             String fromEmail,
                             String fromName) {
        this.webClient = webClientBuilder.baseUrl(BREVO_API_URL).build();
        this.appMetricsService = appMetricsService;
        this.fallbackService = fallbackService;
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    @Override
    public boolean isEmailEnabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    public void sendEmailVerification(String toEmail, String recipientName, String verificationLink, String lang) {
        if (!isEmailEnabled()) {
            fallbackService.sendEmailVerification(toEmail, recipientName, verificationLink, lang);
            return;
        }

        EmailTemplates.EmailContent content = EmailTemplates.buildVerificationEmail(recipientName, verificationLink, lang);
        sendViaBrevo(toEmail, recipientName, content.subject(), content.htmlContent(), content.textContent());
    }

    @Override
    public void sendPasswordReset(String toEmail, String recipientName, String resetLink, String lang) {
        if (!isEmailEnabled()) {
            fallbackService.sendPasswordReset(toEmail, recipientName, resetLink, lang);
            return;
        }

        EmailTemplates.EmailContent content = EmailTemplates.buildPasswordResetEmail(recipientName, resetLink, lang);
        sendViaBrevo(toEmail, recipientName, content.subject(), content.htmlContent(), content.textContent());
    }

    @Override
    public void sendPasswordChanged(String toEmail, String recipientName, String lang) {
        if (!isEmailEnabled()) {
            fallbackService.sendPasswordChanged(toEmail, recipientName, lang);
            return;
        }

        EmailTemplates.EmailContent content = EmailTemplates.buildPasswordChangedEmail(recipientName, lang);
        sendViaBrevo(toEmail, recipientName, content.subject(), content.htmlContent(), content.textContent());
    }

    private void sendViaBrevo(String toEmail, String recipientName, String subject, String htmlContent, String textContent) {
        String masked = LogScrubberUtil.maskEmail(toEmail);
        String name = (recipientName != null && !recipientName.isBlank()) ? recipientName : "User";

        Map<String, Object> payload = Map.of(
                "sender", Map.of("name", fromName, "email", fromEmail),
                "to", List.of(Map.of("email", toEmail, "name", name)),
                "subject", subject,
                "htmlContent", htmlContent,
                "textContent", textContent
        );

        try {
            BrevoResponse response = webClient.post()
                    .header("api-key", apiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(payload)
                    .retrieve()
                    .bodyToMono(BrevoResponse.class)
                    .timeout(Duration.ofSeconds(10))
                    .retryWhen(Retry.backoff(2, Duration.ofMillis(500))
                            .filter(this::isRetryable)
                    )
                    .block();

            String messageId = response != null ? response.messageId() : "unknown";
            log.info("Email sent via Brevo. Provider messageId: {} for recipient: {}", messageId, masked);
            appMetricsService.incrementEmailSent("success");
        } catch (Exception ex) {
            log.error("Failed to send email to {} via Brevo: {}", masked, ex.getMessage());
            appMetricsService.incrementEmailSent("failure");
        }
    }

    private boolean isRetryable(Throwable ex) {
        if (ex instanceof WebClientResponseException wcre) {
            int status = wcre.getStatusCode().value();
            return status == 429 || (status >= 500 && status < 600);
        }
        return false;
    }

    public record BrevoResponse(@JsonProperty("messageId") String messageId) {}
}

