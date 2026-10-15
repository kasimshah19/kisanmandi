package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.InvalidStatusTransitionException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final ReviewService reviewService;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        java.time.ZoneId istZone = java.time.ZoneId.of("Asia/Kolkata");
        LocalDate today = LocalDate.now(istZone);
        java.time.LocalDateTime startOf30DaysAgo = today.minusDays(29).atStartOfDay();
        java.time.LocalDateTime startOf7DaysAgo = today.minusDays(6).atStartOfDay();
        java.time.LocalDateTime startOf6MonthsAgo = today.minusMonths(5).withDayOfMonth(1).atStartOfDay();

        long totalUsers = userRepository.count();
        long farmersCount = userRepository.countByRole(Role.FARMER);
        long customersCount = userRepository.countByRole(Role.CUSTOMER);
        long adminsCount = userRepository.countByRole(Role.ADMIN);
        long blockedUsers = userRepository.countByStatus(UserStatus.BLOCKED);

        long pendingFarmers = farmerProfileRepository.countByApprovalStatus(ApprovalStatus.PENDING);
        long approvedFarmers = farmerProfileRepository.countByApprovalStatus(ApprovalStatus.APPROVED);
        long rejectedFarmers = farmerProfileRepository.countByApprovalStatus(ApprovalStatus.REJECTED);

        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByActiveTrueAndDeletedFalseAndAdminHiddenFalse();
        long hiddenByFarmer = productRepository.countByActiveFalseAndDeletedFalse();
        long hiddenByAdmin = productRepository.countByAdminHiddenTrueAndDeletedFalse();
        long deletedProducts = productRepository.countByDeletedTrue();

        long totalOrders = orderRepository.count();
        long ordersLast7Days = orderRepository.countByCreatedAtAfter(startOf7DaysAgo);
        long ordersLast30Days = orderRepository.countByCreatedAtAfter(startOf30DaysAgo);

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus st : OrderStatus.values()) {
            byStatus.put(st.name(), 0L);
        }
        for (Object[] row : orderRepository.countOrdersByStatus()) {
            OrderStatus st = (OrderStatus) row[0];
            Long cnt = (Long) row[1];
            byStatus.put(st.name(), cnt);
        }

        BigDecimal gmvDelivered = orderRepository.sumTotalAmountByStatus(OrderStatus.DELIVERED);
        if (gmvDelivered == null) {
            gmvDelivered = BigDecimal.ZERO;
        }

        BigDecimal revenueLast30Days = orderRepository.sumTotalAmountByStatusAndCreatedAtAfter(OrderStatus.DELIVERED, startOf30DaysAgo);
        if (revenueLast30Days == null) {
            revenueLast30Days = BigDecimal.ZERO;
        }

        // Monthly platform sales trend (past 6 months) with real data and zero filling
        List<Order> deliveredOrders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        Map<java.time.YearMonth, BigDecimal> monthlyTotals = new HashMap<>();
        for (Order o : deliveredOrders) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOf6MonthsAgo)) {
                java.time.YearMonth ym = java.time.YearMonth.from(o.getCreatedAt());
                monthlyTotals.merge(ym, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
            }
        }
        List<Map<String, Object>> salesByMonth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            java.time.YearMonth ym = java.time.YearMonth.from(today.minusMonths(i));
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            BigDecimal monthSales = monthlyTotals.getOrDefault(ym, BigDecimal.ZERO);
            salesByMonth.add(Map.of("name", label, "sales", monthSales));
        }

        // Daily orders and revenue per day (last 30 days) with zero filling
        List<AdminStatsResponse.DailyStat> ordersPerDay = new ArrayList<>();
        List<AdminStatsResponse.DailyStat> revenuePerDay = new ArrayList<>();
        Map<LocalDate, Long> dailyOrderCounts = new HashMap<>();
        Map<LocalDate, BigDecimal> dailyRevenueTotals = new HashMap<>();
        for (Order o : orderRepository.findAll()) {
            if (o.getCreatedAt() != null && !o.getCreatedAt().isBefore(startOf30DaysAgo)) {
                LocalDate dt = o.getCreatedAt().toLocalDate();
                dailyOrderCounts.merge(dt, 1L, Long::sum);
                if (o.getStatus() == OrderStatus.DELIVERED) {
                    dailyRevenueTotals.merge(dt, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
                }
            }
        }
        for (int i = 29; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dStr = d.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            ordersPerDay.add(AdminStatsResponse.DailyStat.builder()
                    .date(dStr)
                    .value(dailyOrderCounts.getOrDefault(d, 0L))
                    .build());
            revenuePerDay.add(AdminStatsResponse.DailyStat.builder()
                    .date(dStr)
                    .value(dailyRevenueTotals.getOrDefault(d, BigDecimal.ZERO))
                    .build());
        }

        // Reviews stats
        long totalReviews = reviewRepository.count();
        long hiddenReviews = reviewRepository.countByHiddenTrue();
        BigDecimal avgPlatformRating = BigDecimal.valueOf(reviewRepository.getPlatformAverageRating().orElse(0.0)).setScale(2, java.math.RoundingMode.HALF_UP);

        // Top farmers by delivered revenue
        Map<Long, BigDecimal> farmerDeliveredRevenue = new HashMap<>();
        Map<Long, Long> farmerDeliveredCounts = new HashMap<>();
        for (Order o : deliveredOrders) {
            Long fId = o.getFarmer().getId();
            farmerDeliveredRevenue.merge(fId, o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO, BigDecimal::add);
            farmerDeliveredCounts.merge(fId, 1L, Long::sum);
        }
        List<AdminStatsResponse.TopFarmer> topFarmers = farmerDeliveredRevenue.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .limit(5)
                .map(e -> {
                    Long fId = e.getKey();
                    FarmerProfile fp = farmerProfileRepository.findByUserId(fId).orElse(null);
                    return AdminStatsResponse.TopFarmer.builder()
                            .farmerId(fId)
                            .farmName(fp != null ? fp.getFarmName() : "Farmer #" + fId)
                            .revenue(e.getValue())
                            .deliveredOrders(farmerDeliveredCounts.getOrDefault(fId, 0L))
                            .ratingAvg(fp != null && fp.getRatingAvg() != null ? fp.getRatingAvg() : BigDecimal.ZERO)
                            .build();
                })
                .collect(Collectors.toList());

        long recentSignups = userRepository.countByCreatedAtAfter(startOf30DaysAgo);

        return AdminStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalSales(gmvDelivered)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .salesByMonth(salesByMonth)
                .users(AdminStatsResponse.UsersStats.builder()
                        .total(totalUsers)
                        .farmers(farmersCount)
                        .customers(customersCount)
                        .admins(adminsCount)
                        .blocked(blockedUsers)
                        .build())
                .farmers(AdminStatsResponse.FarmersStats.builder()
                        .pending(pendingFarmers)
                        .approved(approvedFarmers)
                        .rejected(rejectedFarmers)
                        .build())
                .products(AdminStatsResponse.ProductsStats.builder()
                        .total(totalProducts)
                        .active(activeProducts)
                        .hiddenByFarmer(hiddenByFarmer)
                        .hiddenByAdmin(hiddenByAdmin)
                        .deleted(deletedProducts)
                        .build())
                .orders(AdminStatsResponse.OrdersStats.builder()
                        .total(totalOrders)
                        .byStatus(byStatus)
                        .ordersLast7Days(ordersLast7Days)
                        .ordersLast30Days(ordersLast30Days)
                        .build())
                .revenue(AdminStatsResponse.RevenueStats.builder()
                        .gmvDelivered(gmvDelivered)
                        .revenueLast30Days(revenueLast30Days)
                        .build())
                .ordersPerDay(ordersPerDay)
                .revenuePerDay(revenuePerDay)
                .topFarmers(topFarmers)
                .reviews(AdminStatsResponse.ReviewsStats.builder()
                        .total(totalReviews)
                        .hidden(hiddenReviews)
                        .overallAverage(avgPlatformRating)
                        .build())
                .recentSignups(recentSignups)
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> getUsers(Pageable pageable) {
        Page<User> usersPage = userRepository.findAll(pageable);
        List<UserResponse> list = usersPage.getContent().stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .phone(u.getPhone())
                        .role(u.getRole() != null ? u.getRole().name() : null)
                        .status(u.getStatus() != null ? u.getStatus().name() : null)
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<UserResponse>builder()
                .content(list)
                .page(usersPage.getNumber())
                .size(usersPage.getSize())
                .totalElements(usersPage.getTotalElements())
                .totalPages(usersPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(Pageable pageable) {
        Page<Product> productPage = productRepository.findAllForAdmin(pageable);
        List<ProductResponse> list = productPage.getContent().stream()
                .map(p -> ProductResponse.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .description(p.getDescription())
                        .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                        .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                        .pricePerUnit(p.getPricePerUnit())
                        .unit(p.getUnit())
                        .quantityAvailable(p.getQuantityAvailable())
                        .imageUrl(p.getImageUrl())
                        .active(p.isActive())
                        .createdAt(p.getCreatedAt())
                        .farmerId(p.getFarmer() != null ? p.getFarmer().getId() : null)
                        .farmerName(p.getFarmer() != null ? p.getFarmer().getName() : null)
                        .adminHidden(p.isAdminHidden())
                        .adminHiddenReason(p.getAdminHiddenReason())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<ProductResponse>builder()
                .content(list)
                .page(productPage.getNumber())
                .size(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrders(Pageable pageable) {
        Page<Order> orderPage = orderRepository.findAllForAdmin(pageable);
        List<OrderResponse> list = orderPage.getContent().stream()
                .map(o -> OrderResponse.builder()
                        .id(o.getId())
                        .status(o.getStatus())
                        .paymentMode(o.getPaymentMode())
                        .paymentStatus(o.getPaymentStatus())
                        .totalAmount(o.getTotalAmount())
                        .createdAt(o.getCreatedAt())
                        .customerName(o.getCustomer() != null ? o.getCustomer().getName() : "N/A")
                        .customerPhone(o.getCustomer() != null ? o.getCustomer().getPhone() : null)
                        .farmerName(o.getFarmer() != null ? o.getFarmer().getName() : "N/A")
                        .farmerPhone(o.getFarmer() != null ? o.getFarmer().getPhone() : null)
                        .shipName(o.getShipName())
                        .shipPhone(o.getShipPhone())
                        .shipLine1(o.getShipLine1())
                        .shipCity(o.getShipCity())
                        .shipState(o.getShipState())
                        .shipPincode(o.getShipPincode())
                        .build())
                .collect(Collectors.toList());

        return PageResponse.<OrderResponse>builder()
                .content(list)
                .page(orderPage.getNumber())
                .size(orderPage.getSize())
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .build();
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getReviews(Boolean hidden, Integer rating, Long farmerId, Pageable pageable) {
        Page<Review> reviewPage = reviewRepository.findAllForAdmin(hidden, rating, farmerId, pageable);
        List<ReviewResponse> list = reviewPage.getContent().stream()
                .map(r -> {
                    String productName = "Produce Order";
                    if (r.getOrder() != null && r.getOrder().getItems() != null && !r.getOrder().getItems().isEmpty()) {
                        productName = r.getOrder().getItems().get(0).getProductName();
                    }
                    String custName = r.getCustomer() != null ? r.getCustomer().getName() : "Anonymous";
                    return ReviewResponse.builder()
                            .id(r.getId())
                            .rating(r.getRating())
                            .comment(r.getComment())
                            .reviewerName(custName)
                            .customerName(custName)
                            .productName(productName)
                            .createdAt(r.getCreatedAt())
                            .orderNumber(r.getOrder() != null ? r.getOrder().getId().toString() : "")
                            .hidden(r.isHidden())
                            .hiddenReason(r.getHiddenReason())
                            .build();
                })
                .collect(Collectors.toList());

        return PageResponse.<ReviewResponse>builder()
                .content(list)
                .page(reviewPage.getNumber())
                .size(reviewPage.getSize())
                .totalElements(reviewPage.getTotalElements())
                .totalPages(reviewPage.getTotalPages())
                .build();
    }

    @Transactional
    public void blockUser(Long userId, BlockRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Cannot block an administrator account");
        }
        user.setStatus(UserStatus.BLOCKED);
        user.setBlockedReason(request != null ? request.getReason() : null);
        userRepository.save(user);
    }

    @Transactional
    public void unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus(UserStatus.ACTIVE);
        user.setBlockedReason(null);
        userRepository.save(user);
    }

    @Transactional
    public void hideProduct(Long productId, HideRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setAdminHidden(true);
        product.setAdminHiddenReason(request != null ? request.getReason() : null);
        productRepository.save(product);
    }

    @Transactional
    public void unhideProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setAdminHidden(false);
        product.setAdminHiddenReason(null);
        productRepository.save(product);
    }

    @Transactional
    public void cancelOrder(Long orderId, CancelRequest request) {
        Order order = orderRepository.findWithItemsAndHistoryById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        OrderStatus current = order.getStatus();
        if (current == OrderStatus.CANCELLED || current == OrderStatus.REJECTED) {
            throw new InvalidStatusTransitionException("Order is already in a terminal state: " + current);
        }
        if (current == OrderStatus.OUT_FOR_DELIVERY || current == OrderStatus.DELIVERED) {
            throw new InvalidStatusTransitionException("Cannot cancel an order that is out for delivery or delivered");
        }

        // Atomic conditional check-and-update to prevent concurrent cancellations
        int updated = orderRepository.updateStatusIfCurrentStatusIn(
                orderId, 
                java.util.List.of(OrderStatus.PLACED, OrderStatus.ACCEPTED, OrderStatus.PACKED), 
                OrderStatus.CANCELLED
        );
        if (updated == 0) {
            throw new InvalidStatusTransitionException("Order is no longer in an eligible state for cancellation");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .status(OrderStatus.CANCELLED)
                .changedByRole("ADMIN")
                .note(request != null ? request.getReason() : null)
                .build();
        
        order.addHistory(history);
        orderRepository.save(order);
    }

    @Transactional
    public void hideReview(Long reviewId, HideRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setHidden(true);
        review.setHiddenReason(request != null ? request.getReason() : null);
        reviewRepository.save(review);
        if (review.getFarmer() != null) {
            reviewService.recalculateFarmerRating(review.getFarmer().getId());
        }
    }

    @Transactional
    public void unhideReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setHidden(false);
        review.setHiddenReason(null);
        reviewRepository.save(review);
        if (review.getFarmer() != null) {
            reviewService.recalculateFarmerRating(review.getFarmer().getId());
        }
    }
}
