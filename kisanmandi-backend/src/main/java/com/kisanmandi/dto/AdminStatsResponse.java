package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class AdminStatsResponse {
    private UsersStats users;
    private FarmersStats farmers;
    private ProductsStats products;
    private OrdersStats orders;
    private RevenueStats revenue;
    private List<DailyStat> ordersPerDay;
    private List<DailyStat> revenuePerDay;
    private List<TopFarmer> topFarmers;
    private ReviewsStats reviews;
    private long recentSignups;

    @Data
    @Builder
    public static class UsersStats {
        private long total;
        private long farmers;
        private long customers;
        private long admins;
        private long blocked;
    }

    @Data
    @Builder
    public static class FarmersStats {
        private long pending;
        private long approved;
        private long rejected;
    }

    @Data
    @Builder
    public static class ProductsStats {
        private long total;
        private long active;
        private long hiddenByFarmer;
        private long hiddenByAdmin;
        private long deleted;
    }

    @Data
    @Builder
    public static class OrdersStats {
        private long total;
        private Map<String, Long> byStatus;
        private long ordersLast7Days;
        private long ordersLast30Days;
    }

    @Data
    @Builder
    public static class RevenueStats {
        private BigDecimal gmvDelivered;
        private BigDecimal revenueLast30Days;
    }

    @Data
    @Builder
    public static class DailyStat {
        private String date;
        private Number value;
    }

    @Data
    @Builder
    public static class TopFarmer {
        private Long farmerId;
        private String farmName;
        private BigDecimal revenue;
        private long deliveredOrders;
        private BigDecimal ratingAvg;
    }

    @Data
    @Builder
    public static class ReviewsStats {
        private long total;
        private long hidden;
        private BigDecimal overallAverage;
    }
}
