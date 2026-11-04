package com.kisanmandi.config;

import com.kisanmandi.service.payment.FakePaymentGateway;
import com.kisanmandi.service.payment.PaymentGateway;
import com.kisanmandi.service.payment.RazorpayGateway;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class PaymentConfig {

    @Value("${app.payment.razorpay.key-id:${RAZORPAY_KEY_ID:}}")
    private String keyId;

    @Value("${app.payment.razorpay.key-secret:${RAZORPAY_KEY_SECRET:}}")
    private String keySecret;

    @Value("${app.payment.razorpay.webhook-secret:${RAZORPAY_WEBHOOK_SECRET:}}")
    private String webhookSecret;

    @Value("${app.payments.allow-live-keys:false}")
    private boolean allowLiveKeys;

    @Value("${app.payments.window-minutes:15}")
    private int windowMinutes;

    @PostConstruct
    public void validateKeys() {
        if (keyId != null && keyId.startsWith("rzp_live_") && !allowLiveKeys) {
            String msg = "FATAL: Live Razorpay key detected (" + keyId.substring(0, 8) +
                    "...). KisanMandi refuses to start with live keys unless app.payments.allow-live-keys=true.";
            log.error(msg);
            throw new IllegalStateException(msg);
        }

        if (keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank()) {
            log.info("Razorpay Payment Gateway initialized in TEST mode (key_id: {}...)",
                    keyId.length() > 10 ? keyId.substring(0, 10) : keyId);
        } else {
            log.warn("Razorpay credentials missing. Using FakePaymentGateway for test/local development.");
        }
    }

    @Bean
    public PaymentGateway paymentGateway() {
        if (keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank()) {
            return new RazorpayGateway(keyId, keySecret, webhookSecret);
        }
        return new FakePaymentGateway(keyId, keySecret, webhookSecret);
    }

    public int getWindowMinutes() {
        return windowMinutes;
    }

    public String getKeyId() {
        return keyId;
    }

    public String getPublicRazorpayKeyId() {
        return keyId != null ? keyId : "";
    }

    public boolean isOnlineEnabled() {
        return isOnlinePaymentAvailable();
    }

    public boolean isOnlinePaymentAvailable() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }
}
