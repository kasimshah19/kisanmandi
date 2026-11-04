package com.kisanmandi.service.payment;

import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class FakePaymentGateway implements PaymentGateway {

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;
    private final Map<String, GatewayOrder> simulatedOrders = new ConcurrentHashMap<>();
    private final Map<String, GatewayPayment> simulatedPayments = new ConcurrentHashMap<>();

    @Setter
    private boolean shouldFailOrderCreation = false;

    public void setSimulateOrderCreationFailure(boolean fail) {
        this.shouldFailOrderCreation = fail;
    }

    public static String calculateHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC-SHA256", e);
        }
    }

    public FakePaymentGateway(String keyId, String keySecret, String webhookSecret) {
        this.keyId = keyId != null && !keyId.isBlank() ? keyId : "rzp_test_fake123456789";
        this.keySecret = keySecret != null && !keySecret.isBlank() ? keySecret : "fake_secret_key_123";
        this.webhookSecret = webhookSecret != null && !webhookSecret.isBlank() ? webhookSecret : "fake_webhook_secret_123";
    }

    @Override
    public GatewayOrder createOrder(long amountPaise, String currency, String receipt, Map<String, String> notes) {
        if (shouldFailOrderCreation) {
            throw new PaymentGatewayException("Simulated gateway failure for testing");
        }
        String orderId = "order_fake_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        GatewayOrder order = new GatewayOrder(
                orderId,
                amountPaise,
                currency != null ? currency : "INR",
                receipt,
                "created"
        );
        simulatedOrders.put(orderId, order);
        log.info("[FAKE GATEWAY] Created simulated order id={} amountPaise={} receipt={}", orderId, amountPaise, receipt);
        return order;
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        // Allow tests to pass precalculated HMAC or a test signature prefix
        if (signature.startsWith("fake_sig_valid_") || "mock_sig_valid".equals(signature)) {
            return true;
        }
        try {
            String payload = orderId + "|" + paymentId;
            String expected = calculateHmacSha256(payload, keySecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, String signature) {
        if (rawBody == null || signature == null) {
            return false;
        }
        if (signature.startsWith("fake_webhook_sig_valid_")) {
            return true;
        }
        try {
            String expected = calculateHmacSha256(rawBody, webhookSecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public GatewayPayment fetchPayment(String paymentId) {
        if (simulatedPayments.containsKey(paymentId)) {
            return simulatedPayments.get(paymentId);
        }
        return new GatewayPayment(
                paymentId,
                "order_fake_default",
                50000L,
                "INR",
                "captured",
                "upi",
                true
        );
    }

    public void registerSimulatedPayment(GatewayPayment payment) {
        simulatedPayments.put(payment.id(), payment);
    }

    @Override
    public boolean isConfigured() {
        return true;
    }

    @Override
    public String getKeyId() {
        return keyId;
    }

    public String computeHmacSignature(String orderId, String paymentId) {
        try {
            return calculateHmacSha256(orderId + "|" + paymentId, keySecret);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String computeWebhookHmac(String rawBody) {
        try {
            return calculateHmacSha256(rawBody, webhookSecret);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(rawHmac);
    }
}
