package com.kisanmandi.service.payment;

import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
public class RazorpayGateway implements PaymentGateway {

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;
    private final RazorpayClient client;

    public RazorpayGateway(String keyId, String keySecret, String webhookSecret) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
        try {
            this.client = new RazorpayClient(keyId, keySecret);
        } catch (RazorpayException e) {
            log.error("Failed to initialize RazorpayClient: {}", e.getMessage());
            throw new IllegalStateException("Failed to initialize RazorpayClient", e);
        }
    }

    @Override
    public GatewayOrder createOrder(long amountPaise, String currency, String receipt, Map<String, String> notes) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", currency != null ? currency : "INR");
            if (receipt != null && !receipt.isBlank()) {
                orderRequest.put("receipt", receipt);
            }
            if (notes != null && !notes.isEmpty()) {
                JSONObject notesObj = new JSONObject();
                notes.forEach(notesObj::put);
                orderRequest.put("notes", notesObj);
            }

            Order rzpOrder = client.orders.create(orderRequest);
            return new GatewayOrder(
                    rzpOrder.get("id"),
                    ((Number) rzpOrder.get("amount")).longValue(),
                    rzpOrder.get("currency"),
                    rzpOrder.has("receipt") ? rzpOrder.get("receipt") : null,
                    rzpOrder.get("status")
            );
        } catch (RazorpayException e) {
            log.error("Failed to create Razorpay order for receipt={}: {}", receipt, e.getMessage());
            throw new PaymentGatewayException("Failed to create order on payment gateway: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId == null || paymentId == null || signature == null) {
            return false;
        }
        try {
            String payload = orderId + "|" + paymentId;
            String expected = calculateHmacSha256(payload, keySecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.warn("Payment signature verification failed with error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, String signature) {
        if (rawBody == null || signature == null || webhookSecret == null || webhookSecret.isBlank()) {
            return false;
        }
        try {
            String expected = calculateHmacSha256(rawBody, webhookSecret);
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    signature.trim().getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.warn("Webhook signature verification failed with error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public GatewayPayment fetchPayment(String paymentId) {
        try {
            Payment p = client.payments.fetch(paymentId);
            return new GatewayPayment(
                    p.get("id"),
                    p.has("order_id") ? p.get("order_id") : null,
                    ((Number) p.get("amount")).longValue(),
                    p.get("currency"),
                    p.get("status"),
                    p.has("method") ? p.get("method") : null,
                    p.has("captured") && Boolean.TRUE.equals(p.get("captured"))
            );
        } catch (RazorpayException e) {
            log.warn("Failed to fetch Razorpay payment {}: {}", paymentId, e.getMessage());
            throw new PaymentGatewayException("Failed to fetch payment details: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isConfigured() {
        return keyId != null && !keyId.isBlank() && keySecret != null && !keySecret.isBlank();
    }

    @Override
    public String getKeyId() {
        return keyId;
    }

    private String calculateHmacSha256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        mac.init(secretKey);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(rawHmac);
    }
}

