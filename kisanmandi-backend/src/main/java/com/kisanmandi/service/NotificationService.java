package com.kisanmandi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.NotificationResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.Notification;
import com.kisanmandi.entity.Order;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.entity.User;
import com.kisanmandi.event.*;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.NotificationRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final List<String> ALLOWED_ROUTE_PREFIXES = List.of(
            "/customer/orders",
            "/farmer/orders",
            "/farmer/products",
            "/farmer/reviews",
            "/farmer/profile",
            "/farmer/dashboard",
            "/account",
            "/notifications"
    );

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final AppMetricsService appMetricsService;
    private final ObjectMapper objectMapper;

    // ─── Route link validation ───
    public static String validateLink(String link) {
        if (link == null || link.isBlank()) return null;
        String trimmed = link.trim();
        if (!trimmed.startsWith("/")) {
            throw new IllegalArgumentException("Notification link must start with '/': " + link);
        }
        boolean allowed = ALLOWED_ROUTE_PREFIXES.stream().anyMatch(trimmed::startsWith);
        if (!allowed) {
            throw new IllegalArgumentException("Notification link prefix not in allowlist: " + link);
        }
        return trimmed;
    }

    // ─── Core Creation Method ───
    @Transactional
    public Notification createNotification(
            User user,
            String type,
            String titleKey,
            String bodyKey,
            Map<String, Object> params,
            String fallbackText,
            String link
    ) {
        if (user == null) {
            log.warn("Cannot create notification for null user: type={}", type);
            return null;
        }

        String validLink = validateLink(link);
        String paramsJson = null;
        if (params != null && !params.isEmpty()) {
            try {
                paramsJson = objectMapper.writeValueAsString(params);
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize notification params to JSON: {}", e.getMessage());
            }
        }

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .titleKey(titleKey != null ? titleKey : "notifications.default.title")
                .bodyKey(bodyKey != null ? bodyKey : "notifications.default.body")
                .paramsJson(paramsJson)
                .fallbackText(fallbackText != null ? fallbackText : "")
                .link(validLink)
                .readAt(null)
                .build();

        Notification saved = notificationRepository.save(notification);
        if (appMetricsService != null) {
            appMetricsService.incrementNotificationsCreated(type);
        }
        log.info("Notification created id={} for user id={} type={}", saved.getId(), user.getId(), type);
        return saved;
    }

    // ─── Backward-compatible createNotification ───
    @Transactional
    public Notification createNotification(User user, String title, String message, String type, String referenceId) {
        String link = null;
        if (referenceId != null && !referenceId.isBlank()) {
            if ("ORDER_PLACED".equalsIgnoreCase(type) || "ORDER_CANCELLED".equalsIgnoreCase(type)) {
                link = "/farmer/orders";
            } else if (type != null && type.toUpperCase(Locale.ROOT).startsWith("ORDER_")) {
                link = "/customer/orders/" + referenceId.trim();
            }
        }
        return createNotification(
                user,
                type != null ? type : "GENERIC",
                "notifications." + (type != null ? type.toLowerCase(Locale.ROOT) : "general") + ".title",
                "notifications." + (type != null ? type.toLowerCase(Locale.ROOT) : "general") + ".body",
                Collections.emptyMap(),
                (title != null ? title + ": " : "") + (message != null ? message : ""),
                link
        );
    }

    // ─── Domain Event Listeners (Normal @EventListener in SAME Transaction) ───

    @EventListener
    public void onOrderPlaced(OrderPlacedEvent event) {
        Order order = event.order();
        if (order == null || order.getFarmer() == null) return;

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("orderId", order.getId());
        params.put("orderNumber", "KM-" + String.format("%05d", order.getId()));
        params.put("customerName", order.getCustomer() != null ? order.getCustomer().getName() : "Customer");
        params.put("amount", order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0");

        String fallback = String.format("New Order #%d received from %s for ₹%s",
                order.getId(),
                order.getCustomer() != null ? order.getCustomer().getName() : "Customer",
                order.getTotalAmount() != null ? order.getTotalAmount().toString() : "0");

        createNotification(
                order.getFarmer(),
                "ORDER_PLACED",
                "notifications.order_placed.title",
                "notifications.order_placed.body",
                params,
                fallback,
                "/farmer/orders"
        );
    }

    @EventListener
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        Order order = event.order();
        if (order == null) return;

        OrderStatus to = event.to();
        String role = event.actorRole();
        String note = event.note();

        // 1. If customer cancelled -> notify farmer
        if (to == OrderStatus.CANCELLED && "CUSTOMER".equalsIgnoreCase(role)) {
            if (order.getFarmer() != null) {
                Map<String, Object> params = new LinkedHashMap<>();
                params.put("orderId", order.getId());
                params.put("orderNumber", "KM-" + String.format("%05d", order.getId()));
                params.put("reason", note != null ? note : "Cancelled by customer");

                String fallback = String.format("Order #%d was cancelled by customer. %s",
                        order.getId(), note != null ? "Reason: " + note : "");

                createNotification(
                        order.getFarmer(),
                        "ORDER_CANCELLED",
                        "notifications.order_cancelled_customer.title",
                        "notifications.order_cancelled_customer.body",
                        params,
                        fallback,
                        "/farmer/orders"
                );
            }
            return;
        }

        // 2. Status transitions notifying customer:
        // ACCEPTED, PACKED, OUT_FOR_DELIVERY, DELIVERED, REJECTED, CANCELLED by ADMIN
        if (order.getCustomer() == null) return;

        String type;
        String titleKey;
        String bodyKey;
        String fallback;
        Map<String, Object> params = new LinkedHashMap<>();
        params.put("orderId", order.getId());
        params.put("orderNumber", "KM-" + String.format("%05d", order.getId()));
        params.put("farmerName", order.getFarmer() != null ? order.getFarmer().getName() : "Farmer");
        if (note != null && !note.isBlank()) {
            params.put("note", note);
            params.put("reason", note);
        }

        switch (to) {
            case ACCEPTED -> {
                type = "ORDER_ACCEPTED";
                titleKey = "notifications.order_accepted.title";
                bodyKey = "notifications.order_accepted.body";
                fallback = "Your Order #" + order.getId() + " has been accepted by the farmer.";
            }
            case PACKED -> {
                type = "ORDER_PACKED";
                titleKey = "notifications.order_packed.title";
                bodyKey = "notifications.order_packed.body";
                fallback = "Your Order #" + order.getId() + " is packed and ready for dispatch.";
            }
            case OUT_FOR_DELIVERY -> {
                type = "ORDER_OUT_FOR_DELIVERY";
                titleKey = "notifications.order_out_for_delivery.title";
                bodyKey = "notifications.order_out_for_delivery.body";
                fallback = "Your Order #" + order.getId() + " is out for delivery.";
            }
            case DELIVERED -> {
                type = "ORDER_DELIVERED";
                titleKey = "notifications.order_delivered.title";
                bodyKey = "notifications.order_delivered.body";
                fallback = "Your Order #" + order.getId() + " has been delivered! Please review your items.";
            }
            case REJECTED -> {
                type = "ORDER_REJECTED";
                titleKey = "notifications.order_rejected.title";
                bodyKey = "notifications.order_rejected.body";
                fallback = "Your Order #" + order.getId() + " was rejected by the farmer." +
                        (note != null && !note.isBlank() ? " Reason: " + note : "");
            }
            case CANCELLED -> {
                // If cancelled by admin (or anything other than customer)
                type = "ORDER_CANCELLED";
                titleKey = "notifications.order_cancelled_admin.title";
                bodyKey = "notifications.order_cancelled_admin.body";
                fallback = "Your Order #" + order.getId() + " was cancelled by admin." +
                        (note != null && !note.isBlank() ? " Reason: " + note : "");
            }
            default -> {
                return;
            }
        }

        createNotification(
                order.getCustomer(),
                type,
                titleKey,
                bodyKey,
                params,
                fallback,
                "/customer/orders/" + order.getId()
        );
    }

    @EventListener
    public void onReviewCreated(ReviewCreatedEvent event) {
        if (event.farmerId() == null) return;
        userRepository.findById(event.farmerId()).ifPresent(farmer -> {
            Map<String, Object> params = new LinkedHashMap<>();
            params.put("rating", event.rating());
            params.put("reviewerName", event.customerName() != null ? event.customerName() : "Customer");
            params.put("orderId", event.orderId());

            String fallback = String.format("New %d-star review received from %s",
                    event.rating(),
                    event.customerName() != null ? event.customerName() : "Customer");

            createNotification(
                    farmer,
                    "REVIEW_CREATED",
                    "notifications.review_created.title",
                    "notifications.review_created.body",
                    params,
                    fallback,
                    "/farmer/reviews"
            );
        });
    }

    @EventListener
    public void onFarmerApprovalChanged(FarmerApprovalChangedEvent event) {
        if (event.farmerId() == null) return;
        userRepository.findById(event.farmerId()).ifPresent(farmer -> {
            boolean approved = event.status() == ApprovalStatus.APPROVED;
            String type = approved ? "FARMER_APPROVED" : "FARMER_REJECTED";
            String titleKey = approved ? "notifications.farmer_approved.title" : "notifications.farmer_rejected.title";
            String bodyKey = approved ? "notifications.farmer_approved.body" : "notifications.farmer_rejected.body";
            String link = approved ? "/farmer/dashboard" : "/farmer/profile";

            Map<String, Object> params = new LinkedHashMap<>();
            if (event.reason() != null && !event.reason().isBlank()) {
                params.put("reason", event.reason());
            }

            String fallback = approved
                    ? "Congratulations! Your farmer account has been approved. You can now sell products."
                    : "Your farmer profile was not approved." +
                    (event.reason() != null ? " Reason: " + event.reason() : "");

            createNotification(
                    farmer,
                    type,
                    titleKey,
                    bodyKey,
                    params,
                    fallback,
                    link
            );
        });
    }

    @EventListener
    public void onProductModeratedByAdmin(ProductModeratedByAdminEvent event) {
        if (event.farmerId() == null) return;
        userRepository.findById(event.farmerId()).ifPresent(farmer -> {
            boolean hidden = event.hidden();
            String type = hidden ? "PRODUCT_HIDDEN" : "PRODUCT_RESTORED";
            String titleKey = hidden ? "notifications.product_hidden.title" : "notifications.product_restored.title";
            String bodyKey = hidden ? "notifications.product_hidden.body" : "notifications.product_restored.body";

            Map<String, Object> params = new LinkedHashMap<>();
            params.put("productName", event.productName() != null ? event.productName() : "Product");
            params.put("productId", event.productId());
            if (event.reason() != null && !event.reason().isBlank()) {
                params.put("reason", event.reason());
            }

            String fallback = hidden
                    ? String.format("Your product '%s' has been hidden by admin. %s",
                    event.productName(), event.reason() != null ? "Reason: " + event.reason() : "")
                    : String.format("Your product '%s' has been unhidden and restored by admin.",
                    event.productName());

            createNotification(
                    farmer,
                    type,
                    titleKey,
                    bodyKey,
                    params,
                    fallback,
                    "/farmer/products"
            );
        });
    }

    @EventListener
    public void onLowStockDetected(LowStockDetectedEvent event) {
        if (event.farmerId() == null) return;
        userRepository.findById(event.farmerId()).ifPresent(farmer -> {
            Map<String, Object> params = new LinkedHashMap<>();
            params.put("productName", event.productName() != null ? event.productName() : "Product");
            params.put("productId", event.productId());
            params.put("remainingStock", event.remainingStock() != null ? event.remainingStock().toString() : "0");

            String fallback = String.format("Low stock alert: '%s' has only %s left in stock.",
                    event.productName(), event.remainingStock());

            createNotification(
                    farmer,
                    "LOW_STOCK",
                    "notifications.low_stock.title",
                    "notifications.low_stock.body",
                    params,
                    fallback,
                    "/farmer/products"
            );
        });
    }

    // ─── Query & Mutation Methods ───

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getMyNotifications(Long userId, int page, int size, Boolean unreadOnly) {
        int cappedSize = Math.max(1, Math.min(size, 50));
        Pageable pageable = PageRequest.of(Math.max(0, page), cappedSize);

        Page<Notification> pageResult;
        if (Boolean.TRUE.equals(unreadOnly)) {
            pageResult = notificationRepository.findByUserIdAndReadAtIsNullOrderByCreatedAtDesc(userId, pageable);
        } else {
            pageResult = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        }

        List<NotificationResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getRecentNotifications(Long userId) {
        return notificationRepository.findTop8ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadAtIsNull(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.markRead();
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId, LocalDateTime.now());
    }

    @Transactional
    public void deleteNotification(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notificationRepository.delete(notification);
    }

    // ─── Scheduled Retention Cleanup (and on Startup) ───
    @Scheduled(cron = "0 0 4 * * *") // Daily at 4:00 AM
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);

        int readDeleted = notificationRepository.deleteReadOlderThan(thirtyDaysAgo);
        int oldDeleted = notificationRepository.deleteOlderThan(ninetyDaysAgo);
        if (readDeleted > 0 || oldDeleted > 0) {
            log.info("Notifications retention cleanup: deleted {} read (>30d) and {} old (>90d) notifications",
                    readDeleted, oldDeleted);
        }
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .titleKey(n.getTitleKey())
                .bodyKey(n.getBodyKey())
                .paramsJson(n.getParamsJson())
                .fallbackText(n.getFallbackText())
                .link(n.getLink())
                .read(n.isRead())
                .readAt(n.getReadAt())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
