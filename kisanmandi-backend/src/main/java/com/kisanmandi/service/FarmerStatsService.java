package com.kisanmandi.service;

import com.kisanmandi.dto.FarmerStatsResponse;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.entity.Order;
import com.kisanmandi.entity.OrderItem;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.entity.Product;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerStatsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    @Transactional(readOnly = true)
    public FarmerStatsResponse getStats(Long farmerId) {
        ZoneId istZone = ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(istZone);
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime thirtyDaysAgo = today.minusDays(29).atStartOfDay();
        LocalDateTime sixMonthsAgo = today.minusMonths(5).withDayOfMonth(1).atStartOfDay();

        long totalOrders = orderRepository.countByFarmerId(farmerId);
        long pendingOrders = orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.PLACED);
        long completedOrders = orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);

        BigDecimal earnings = orderRepository.sumTotalAmountByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);
        if (earnings == null) {
            earnings = BigDecimal.ZERO;
        }

        BigDecimal pending = orderRepository.sumPendingAmountByFarmerId(farmerId);
        if (pending == null) {
            pending = BigDecimal.ZERO;
        }

        BigDecimal earningsToday = orderRepository.sumFarmerTotalAmountByStatusAndCreatedAtAfter(farmerId, OrderStatus.DELIVERED, startOfToday);
        if (earningsToday == null) {
            earningsToday = BigDecimal.ZERO;
        }

        BigDecimal earningsThisMonth = orderRepository.sumFarmerTotalAmountByStatusAndCreatedAtAfter(farmerId, OrderStatus.DELIVERED, startOfMonth);
        if (earningsThisMonth == null) {
            earningsThisMonth = BigDecimal.ZERO;
        }

        // Ratings & review counts from approved profile
        BigDecimal avgRating = BigDecimal.ZERO;
        long totalReviews = 0;
        Optional<FarmerProfile> profileOpt = farmerProfileRepository.findByUserId(farmerId);
        if (profileOpt.isPresent()) {
            FarmerProfile profile = profileOpt.get();
            avgRating = profile.getRatingAvg() != null ? profile.getRatingAvg() : BigDecimal.ZERO;
            totalReviews = profile.getRatingCount();
        }

        // Real delivered orders for series calculations
        List<Order> deliveredOrders = orderRepository.findByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);

        // Monthly sales trend for the past 6 months (zero filled)
        Map<YearMonth, BigDecimal> monthlyTotals = new HashMap<>();
        for (Order o : deliveredOrders) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(sixMonthsAgo)) {
                YearMonth ym = YearMonth.from(o.getCreatedAt());
                monthlyTotals.merge(ym, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
            }
        }
        List<Map<String, Object>> salesByMonth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.from(today.minusMonths(i));
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal monthSales = monthlyTotals.getOrDefault(ym, BigDecimal.ZERO);
            salesByMonth.add(Map.of("name", label, "sales", monthSales));
        }

        // Daily sales trend for the past 30 days (zero filled)
        Map<LocalDate, BigDecimal> dailyTotals = new HashMap<>();
        for (Order o : deliveredOrders) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(thirtyDaysAgo)) {
                LocalDate dt = o.getCreatedAt().toLocalDate();
                dailyTotals.merge(dt, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
            }
        }
        List<Map<String, Object>> salesLast30Days = new ArrayList<>();
        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String label = d.format(DateTimeFormatter.ofPattern("dd MMM"));
            BigDecimal daySales = dailyTotals.getOrDefault(d, BigDecimal.ZERO);
            salesLast30Days.add(Map.of("date", label, "sales", daySales));
        }

        // Top products by quantity sold
        Map<String, BigDecimal> productSales = new HashMap<>();
        for (Order o : deliveredOrders) {
            if (o.getItems() != null) {
                for (OrderItem item : o.getItems()) {
                    String name = item.getProduct() != null ? item.getProduct().getName() : "Product #" + item.getId();
                    productSales.merge(name, item.getQuantity() != null ? item.getQuantity() : BigDecimal.ZERO, BigDecimal::add);
                }
            }
        }
        List<Map<String, Object>> topProducts = productSales.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> Map.<String, Object>of("name", e.getKey(), "quantitySold", e.getValue()))
                .collect(Collectors.toList());

        // Low stock products (active, not deleted, quantity <= 10)
        List<Product> products = productRepository.findByFarmerIdAndDeletedFalse(farmerId);
        List<Map<String, Object>> lowStockProducts = products.stream()
                .filter(p -> p.isActive() && !p.isDeleted() && p.getQuantityAvailable() != null && p.getQuantityAvailable().compareTo(BigDecimal.valueOf(10)) <= 0)
                .map(p -> Map.<String, Object>of(
                        "id", p.getId(),
                        "name", p.getName(),
                        "quantityAvailable", p.getQuantityAvailable(),
                        "unit", p.getUnit() != null ? p.getUnit().name() : ""
                ))
                .collect(Collectors.toList());

        return FarmerStatsResponse.builder()
                .totalEarnings(earnings)
                .earningsToday(earningsToday)
                .earningsThisMonth(earningsThisMonth)
                .pendingPayouts(pending)
                .pendingCash(pending)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .averageRating(avgRating)
                .totalReviews(totalReviews)
                .salesByMonth(salesByMonth)
                .salesLast30Days(salesLast30Days)
                .topProducts(topProducts)
                .lowStockProducts(lowStockProducts)
                .build();
    }
}
