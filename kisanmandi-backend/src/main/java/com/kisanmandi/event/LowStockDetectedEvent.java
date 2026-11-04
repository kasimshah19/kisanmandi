package com.kisanmandi.event;

import java.math.BigDecimal;

public record LowStockDetectedEvent(
        Long productId,
        Long farmerId,
        String productName,
        BigDecimal remainingStock
) {}
