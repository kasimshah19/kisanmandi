package com.kisanmandi.event;

public record ProductModeratedByAdminEvent(
        Long productId,
        Long farmerId,
        String productName,
        boolean hidden,
        String reason
) {}

