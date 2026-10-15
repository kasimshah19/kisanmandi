package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class FarmerStatsResponse {
    private BigDecimal totalEarnings;
    private BigDecimal earningsToday;
    private BigDecimal earningsThisMonth;
    private BigDecimal pendingPayouts;
    private BigDecimal pendingCash;
    private long totalOrders;
    private long pendingOrders;
    private long completedOrders;
    private BigDecimal averageRating;
    private long totalReviews;
    private java.util.List<java.util.Map<String, Object>> salesByMonth;
    private java.util.List<java.util.Map<String, Object>> salesLast30Days;
    private java.util.List<java.util.Map<String, Object>> topProducts;
    private java.util.List<java.util.Map<String, Object>> lowStockProducts;
}
