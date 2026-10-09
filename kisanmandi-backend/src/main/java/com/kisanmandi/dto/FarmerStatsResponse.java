package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FarmerStatsResponse {
    private BigDecimal totalEarnings;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
}
