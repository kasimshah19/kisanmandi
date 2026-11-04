package com.kisanmandi.service.payment;

public record GatewayOrder(
        String id,
        Long amountPaise,
        String currency,
        String receipt,
        String status
) {}

