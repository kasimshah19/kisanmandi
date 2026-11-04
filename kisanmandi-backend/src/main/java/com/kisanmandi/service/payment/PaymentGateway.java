package com.kisanmandi.service.payment;

import java.util.Map;

public interface PaymentGateway {

    GatewayOrder createOrder(long amountPaise, String currency, String receipt, Map<String, String> notes);

    boolean verifyPaymentSignature(String orderId, String paymentId, String signature);

    boolean verifyWebhookSignature(String rawBody, String signature);

    GatewayPayment fetchPayment(String paymentId);

    boolean isConfigured();

    String getKeyId();
}

