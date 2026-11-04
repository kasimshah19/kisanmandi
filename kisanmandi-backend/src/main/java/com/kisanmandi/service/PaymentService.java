package com.kisanmandi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.config.PaymentConfig;
import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.event.OrderPlacedEvent;
import com.kisanmandi.exception.ConflictException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.service.payment.GatewayOrder;
import com.kisanmandi.service.payment.PaymentGateway;
import com.kisanmandi.service.payment.PaymentGatewayException;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.PaymentEventRepository;
import com.kisanmandi.repository.PaymentRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentEventRepository paymentEventRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PaymentGateway paymentGateway;
    private final PaymentConfig paymentConfig;
    private final AppMetricsService appMetricsService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    public boolean isPaymentEnabled() {
        return paymentConfig.isOnlineEnabled();
    }

    public String getKeyId() {
        return paymentConfig.getPublicRazorpayKeyId();
    }

    public int getWindowMinutes() {
        return paymentConfig.getWindowMinutes();
    }

    @Transactional
    public Payment createPaymentRecord(String paymentGroupId, Long customerId, Long amountPaise, String currency, LocalDateTime expiresAt) {
        User customer = userRepository.findById(customerId)
                .orElseGet(() -> User.builder().id(customerId).build());

        Payment payment = Payment.builder()
                .paymentGroupId(paymentGroupId)
                .customer(customer)
                .amountPaise(amountPaise)
                .currency(currency != null ? currency : "INR")
                .status(PaymentRecordStatus.INITIATED)
                .expiresAt(expiresAt)
                .build();

        Payment saved = paymentRepository.save(payment);
        if (appMetricsService != null) {
            appMetricsService.incrementPayments("INITIATED");
        }
        return saved;
    }

    public GatewayOrder createGatewayOrder(String paymentGroupId, Long amountPaise, String currency, Long customerId) {
        String receipt = "km_" + paymentGroupId.replace("-", "");
        if (receipt.length() > 40) {
            receipt = receipt.substring(0, 40);
        }

        Map<String, String> notes = Map.of(
                "paymentGroupId", paymentGroupId,
                "customerId", String.valueOf(customerId)
        );

        return paymentGateway.createOrder(amountPaise, currency != null ? currency : "INR", receipt, notes);
    }

    @Transactional
    public void recordGatewayOrderId(String paymentGroupId, String razorpayOrderId) {
        paymentRepository.findByPaymentGroupId(paymentGroupId).ifPresent(payment -> {
            payment.setRazorpayOrderId(razorpayOrderId);
            payment.setStatus(PaymentRecordStatus.CREATED);
            paymentRepository.save(payment);
            if (appMetricsService != null) {
                appMetricsService.incrementPayments("CREATED");
            }
        });

        List<Order> orders = orderRepository.findByPaymentGroupId(paymentGroupId);
        for (Order o : orders) {
            o.setRazorpayOrderId(razorpayOrderId);
            orderRepository.save(o);
        }
    }

    @Transactional
    public void markFailed(String paymentGroupId, String failureReason) {
        paymentRepository.findByPaymentGroupId(paymentGroupId).ifPresent(payment -> {
            payment.setStatus(PaymentRecordStatus.FAILED);
            payment.setFailureReason(failureReason);
            paymentRepository.save(payment);
            if (appMetricsService != null) {
                appMetricsService.incrementPayments("FAILED");
            }
        });
    }

    @Transactional
    public PaymentVerificationResponse verifyPayment(Long customerId, PaymentVerificationRequest request) {
        Payment payment = null;
        if (request.getRazorpayOrderId() != null && !request.getRazorpayOrderId().isBlank()) {
            payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId()).orElse(null);
        }
        if (payment == null && request.getPaymentGroupId() != null && !request.getPaymentGroupId().isBlank()) {
            payment = paymentRepository.findByPaymentGroupId(request.getPaymentGroupId()).orElse(null);
        }
        if (payment == null && request.getOrderId() != null) {
            Order order = orderRepository.findById(request.getOrderId()).orElse(null);
            if (order != null && order.getPaymentGroupId() != null) {
                payment = paymentRepository.findByPaymentGroupId(order.getPaymentGroupId()).orElse(null);
            }
        }

        if (payment == null) {
            throw new ResourceNotFoundException("Payment not found");
        }

        if (customerId != null && !payment.getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Payment not found");
        }

        boolean valid = paymentGateway.verifyPaymentSignature(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!valid) {
            if (appMetricsService != null) {
                appMetricsService.incrementPaymentVerifications("failed");
            }
            throw new IllegalArgumentException("Invalid payment signature");
        }

        if (payment.getStatus() == PaymentRecordStatus.PAID) {
            if (appMetricsService != null) {
                appMetricsService.incrementPaymentVerifications("already_paid");
            }
            List<Order> orders = orderRepository.findByPaymentGroupId(payment.getPaymentGroupId());
            return PaymentVerificationResponse.builder()
                    .verified(true)
                    .message("Payment already verified")
                    .paymentGroupId(payment.getPaymentGroupId())
                    .orderIds(orders.stream().map(Order::getId).collect(Collectors.toList()))
                    .orderId(!orders.isEmpty() ? orders.get(0).getId() : null)
                    .build();
        }

        return confirmPaymentSuccess(payment, request.getRazorpayPaymentId(), request.getRazorpaySignature(), "CUSTOMER");
    }

    @Transactional
    public void processWebhook(String rawBody, String signatureHeader, String eventIdHeader) {
        boolean valid = paymentGateway.verifyWebhookSignature(rawBody, signatureHeader);
        if (!valid) {
            log.warn("Invalid Razorpay webhook signature");
            if (appMetricsService != null) {
                appMetricsService.incrementPaymentEvents("unknown", "invalid_signature");
            }
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        if (eventIdHeader != null && !eventIdHeader.isBlank()) {
            if (paymentEventRepository.existsByEventId(eventIdHeader)) {
                log.info("Duplicate webhook event ignored: {}", eventIdHeader);
                if (appMetricsService != null) {
                    appMetricsService.incrementPaymentEvents("duplicate", "ignored");
                }
                return;
            }
        }

        String eventType = "unknown";
        String razorpayOrderId = null;
        String razorpayPaymentId = null;
        String outcome = "IGNORED";

        try {
            JsonNode root = objectMapper.readTree(rawBody);
            eventType = root.path("event").asText("unknown");

            JsonNode paymentEntity = root.path("payload").path("payment").path("entity");
            razorpayOrderId = paymentEntity.path("order_id").asText(null);
            razorpayPaymentId = paymentEntity.path("id").asText(null);

            if (razorpayOrderId == null) {
                razorpayOrderId = root.path("payload").path("order").path("entity").path("id").asText(null);
            }

            PaymentEvent eventRecord = PaymentEvent.builder()
                    .eventId(eventIdHeader != null && !eventIdHeader.isBlank() ? eventIdHeader : "evt_" + UUID.randomUUID())
                    .eventType(eventType)
                    .razorpayOrderId(razorpayOrderId)
                    .razorpayPaymentId(razorpayPaymentId)
                    .receivedAt(LocalDateTime.now())
                    .build();

            if ("payment.captured".equals(eventType) || "order.paid".equals(eventType)) {
                if (razorpayOrderId != null) {
                    Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (paymentOpt.isPresent()) {
                        Payment payment = paymentOpt.get();
                        if (payment.getStatus() == PaymentRecordStatus.PAID) {
                            outcome = "ALREADY_PAID";
                        } else {
                            confirmPaymentSuccess(payment, razorpayPaymentId, null, "WEBHOOK");
                            outcome = "CONFIRMED";
                        }
                    } else {
                        outcome = "PAYMENT_NOT_FOUND";
                    }
                }
            } else if ("payment.failed".equals(eventType)) {
                if (razorpayOrderId != null) {
                    Optional<Payment> paymentOpt = paymentRepository.findByRazorpayOrderId(razorpayOrderId);
                    if (paymentOpt.isPresent()) {
                        Payment payment = paymentOpt.get();
                        String errorDesc = paymentEntity.path("error_description").asText("Payment failed");
                        payment.setFailureReason(errorDesc);
                        paymentRepository.save(payment);
                        outcome = "FAILED_RECORDED";
                    }
                }
            }

            eventRecord.setProcessedAt(LocalDateTime.now());
            eventRecord.setOutcome(outcome);
            paymentEventRepository.save(eventRecord);

            if (appMetricsService != null) {
                appMetricsService.incrementPaymentEvents(eventType, outcome);
            }
        } catch (Exception e) {
            log.error("Error processing Razorpay webhook: {}", e.getMessage(), e);
            throw new RuntimeException("Webhook processing error", e);
        }
    }

    private PaymentVerificationResponse confirmPaymentSuccess(Payment payment, String razorpayPaymentId, String razorpaySignature, String sourceRole) {
        List<Order> orders = orderRepository.findByPaymentGroupId(payment.getPaymentGroupId());

        boolean allCancelled = !orders.isEmpty() && orders.stream().allMatch(o -> o.getStatus() == OrderStatus.CANCELLED);
        if (allCancelled) {
            payment.setStatus(PaymentRecordStatus.PAID);
            payment.setPaidAt(LocalDateTime.now());
            if (razorpayPaymentId != null) payment.setRazorpayPaymentId(razorpayPaymentId);
            paymentRepository.save(payment);

            for (Order o : orders) {
                o.setRefundStatus(RefundStatus.REQUIRED);
                orderRepository.save(o);
            }

            log.warn("Late payment received for cancelled/expired paymentGroupId={}. Marked refund_status = REQUIRED", payment.getPaymentGroupId());
            if (appMetricsService != null) {
                appMetricsService.incrementPayments("PAID_LATE");
            }

            return PaymentVerificationResponse.builder()
                    .verified(true)
                    .message("Payment received after expiration. Refund will be processed.")
                    .paymentGroupId(payment.getPaymentGroupId())
                    .orderIds(orders.stream().map(Order::getId).collect(Collectors.toList()))
                    .orderId(!orders.isEmpty() ? orders.get(0).getId() : null)
                    .build();
        }

        for (Order order : orders) {
            int updated = orderRepository.updateStatusIfCurrentStatus(order.getId(), OrderStatus.AWAITING_PAYMENT, OrderStatus.PLACED);
            if (updated > 0) {
                order.setStatus(OrderStatus.PLACED);
                order.setPaymentStatus(PaymentStatus.PAID);
                if (payment.getRazorpayOrderId() != null) {
                    order.setRazorpayOrderId(payment.getRazorpayOrderId());
                }
                if (razorpayPaymentId != null) {
                    order.setRazorpayPaymentId(razorpayPaymentId);
                }
                if (razorpaySignature != null) {
                    order.setRazorpaySignature(razorpaySignature);
                }

                OrderStatusHistory history = OrderStatusHistory.builder()
                        .status(OrderStatus.PLACED)
                        .changedByRole(sourceRole)
                        .note("Paid online (Payment ID: " + (razorpayPaymentId != null ? razorpayPaymentId : "confirmed") + ")")
                        .build();
                order.addHistory(history);
                orderRepository.save(order);

                if (appMetricsService != null) {
                    appMetricsService.incrementOrderStatusChanges(OrderStatus.PLACED.name());
                }

                if (eventPublisher != null) {
                    eventPublisher.publishEvent(new OrderPlacedEvent(order));
                }

                if (notificationService != null) {
                    notificationService.createNotification(
                            order.getCustomer(),
                            "Payment Successful",
                            "Your payment of \u20B9" + order.getTotalAmount() + " for Order #" + order.getId() + " was successful.",
                            "PAYMENT_SUCCESS",
                            String.valueOf(order.getId())
                    );
                }
            } else if (order.getStatus() == OrderStatus.PLACED && order.getPaymentStatus() != PaymentStatus.PAID) {
                order.setPaymentStatus(PaymentStatus.PAID);
                if (razorpayPaymentId != null) {
                    order.setRazorpayPaymentId(razorpayPaymentId);
                }
                if (payment.getRazorpayOrderId() != null) {
                    order.setRazorpayOrderId(payment.getRazorpayOrderId());
                }
                orderRepository.save(order);
            }
        }

        payment.setStatus(PaymentRecordStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        if (razorpayPaymentId != null) payment.setRazorpayPaymentId(razorpayPaymentId);
        paymentRepository.save(payment);

        if (appMetricsService != null) {
            appMetricsService.incrementPayments("PAID");
            appMetricsService.incrementPaymentVerifications("success");
        }

        return PaymentVerificationResponse.builder()
                .verified(true)
                .message("Payment verified successfully")
                .paymentGroupId(payment.getPaymentGroupId())
                .orderIds(orders.stream().map(Order::getId).collect(Collectors.toList()))
                .orderId(!orders.isEmpty() ? orders.get(0).getId() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public CheckoutPaymentDetails retryPayment(Long customerId, String paymentGroupId) {
        Payment payment = paymentRepository.findByPaymentGroupId(paymentGroupId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (!payment.getCustomerId().equals(customerId)) {
            throw new ResourceNotFoundException("Payment not found");
        }

        if (payment.getStatus() == PaymentRecordStatus.PAID) {
            throw new ConflictException("Payment has already been completed");
        }

        if (payment.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ConflictException("payment window ended");
        }

        User customer = userRepository.findById(customerId).orElse(null);

        return CheckoutPaymentDetails.builder()
                .keyId(getKeyId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .amountPaise(payment.getAmountPaise())
                .currency(payment.getCurrency())
                .expiresAt(payment.getExpiresAt())
                .customerPrefill(CustomerPrefill.builder()
                        .name(customer != null ? customer.getName() : "")
                        .email(customer != null ? customer.getEmail() : "")
                        .phone(customer != null ? customer.getPhone() : "")
                        .build())
                .build();
    }

    @Transactional
    public void cancelPaymentGroup(String paymentGroupId, String reason) {
        List<Order> orders = orderRepository.findByPaymentGroupId(paymentGroupId);
        for (Order order : orders) {
            int updated = orderRepository.updateStatusIfCurrentStatus(order.getId(), OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED);
            if (updated > 0) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null) {
                        productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
                    }
                }
                order.setStatus(OrderStatus.CANCELLED);
                OrderStatusHistory history = OrderStatusHistory.builder()
                        .status(OrderStatus.CANCELLED)
                        .changedByRole("CUSTOMER")
                        .note("Cancelled: " + (reason != null ? reason : "Payment cancelled by customer"))
                        .build();
                order.addHistory(history);
                orderRepository.save(order);
                if (appMetricsService != null) {
                    appMetricsService.incrementOrderStatusChanges(OrderStatus.CANCELLED.name());
                }
            }
        }

        paymentRepository.findByPaymentGroupId(paymentGroupId).ifPresent(payment -> {
            if (payment.getStatus() != PaymentRecordStatus.PAID) {
                payment.setStatus(PaymentRecordStatus.CANCELLED);
                paymentRepository.save(payment);
                if (appMetricsService != null) {
                    appMetricsService.incrementPayments("CANCELLED");
                }
            }
        });
    }

    @Scheduled(fixedRate = 120000)
    @Transactional
    public void expirePendingOrders() {
        expirePendingOrders(LocalDateTime.now());
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onStartup() {
        expirePendingOrders(LocalDateTime.now());
    }

    @Transactional
    public void expirePendingOrders(LocalDateTime threshold) {
        List<Order> expiredOrders = orderRepository.findByStatusAndPaymentExpiresAtBefore(OrderStatus.AWAITING_PAYMENT, threshold);
        for (Order order : expiredOrders) {
            int updated = orderRepository.updateStatusIfCurrentStatus(order.getId(), OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED);
            if (updated > 0) {
                for (OrderItem item : order.getItems()) {
                    if (item.getProduct() != null) {
                        productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
                    }
                }
                order.setStatus(OrderStatus.CANCELLED);
                OrderStatusHistory history = OrderStatusHistory.builder()
                        .status(OrderStatus.CANCELLED)
                        .changedByRole("SYSTEM")
                        .note("Payment not completed")
                        .build();
                order.addHistory(history);
                orderRepository.save(order);
                if (appMetricsService != null) {
                    appMetricsService.incrementOrderStatusChanges(OrderStatus.CANCELLED.name());
                }

                if (order.getPaymentGroupId() != null) {
                    paymentRepository.findByPaymentGroupId(order.getPaymentGroupId()).ifPresent(payment -> {
                        if (payment.getStatus() != PaymentRecordStatus.PAID) {
                            payment.setStatus(PaymentRecordStatus.EXPIRED);
                            paymentRepository.save(payment);
                            if (appMetricsService != null) {
                                appMetricsService.incrementPayments("EXPIRED");
                            }
                        }
                    });
                }
            }
        }
    }

    @Transactional
    public PaymentOrderResponse createOrderLegacy(Long customerId, Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found");
        }
        String paymentGroupId = order.getPaymentGroupId();
        if (paymentGroupId == null) {
            paymentGroupId = "km_grp_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
            order.setPaymentGroupId(paymentGroupId);
            order.setPaymentMode(PaymentMode.ONLINE);
            orderRepository.save(order);
        }
        long amountPaise = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        GatewayOrder gatewayOrder = paymentGateway.createOrder(amountPaise, "INR", paymentGroupId, Collections.emptyMap());
        order.setRazorpayOrderId(gatewayOrder.id());
        orderRepository.save(order);

        Optional<Payment> existing = paymentRepository.findByPaymentGroupId(paymentGroupId);
        if (existing.isEmpty()) {
            Payment payment = Payment.builder()
                    .paymentGroupId(paymentGroupId)
                    .customer(order.getCustomer())
                    .amountPaise(amountPaise)
                    .currency("INR")
                    .status(PaymentRecordStatus.CREATED)
                    .razorpayOrderId(gatewayOrder.id())
                    .expiresAt(LocalDateTime.now().plusMinutes(paymentConfig.getWindowMinutes()))
                    .build();
            paymentRepository.save(payment);
        }

        return PaymentOrderResponse.builder()
                .orderId(order.getId())
                .razorpayOrderId(gatewayOrder.id())
                .amount(order.getTotalAmount())
                .currency("INR")
                .keyId(getKeyId())
                .build();
    }

    @Transactional
    public void processRefund(Order order, String reason) {
        if (order == null || order.getPaymentMode() != PaymentMode.ONLINE || order.getPaymentStatus() != PaymentStatus.PAID) {
            return;
        }

        order.setRefundStatus(RefundStatus.REQUIRED);
        orderRepository.save(order);
        log.info("Refund flagged as REQUIRED for order id={}", order.getId());
    }
}
