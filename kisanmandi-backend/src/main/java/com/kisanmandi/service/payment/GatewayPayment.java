package com.kisanmandi.service.payment;

public record GatewayPayment(
        String id,
        String orderId,
        Long amountPaise,
        String currency,
        String status,
        String method,
        boolean captured
) {}

