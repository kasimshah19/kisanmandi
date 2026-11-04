package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.event.LowStockDetectedEvent;
import com.kisanmandi.event.OrderPlacedEvent;
import com.kisanmandi.exception.*;
import com.kisanmandi.service.payment.GatewayOrder;
import com.kisanmandi.service.payment.PaymentGatewayException;
import com.kisanmandi.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AppMetricsService appMetricsService;
    private final PaymentService paymentService;
    private final ApplicationEventPublisher eventPublisher;

    @Data
    @Builder
    public static class PreparedOnlineCheckout {
        private String paymentGroupId;
        private Long amountPaise;
        private LocalDateTime paymentExpiresAt;
        private List<Order> orders;
        private User customer;
    }

    public CheckoutResponse checkout(Long customerId, CheckoutRequest request) {
        if (request.getPaymentMode() == PaymentMode.ONLINE) {
            if (!paymentService.isPaymentEnabled()) {
                throw new IllegalArgumentException("Online payments are currently disabled");
            }

            PreparedOnlineCheckout prep = checkoutOnlineStep1(customerId, request);

            GatewayOrder gatewayOrder;
            try {
                gatewayOrder = paymentService.createGatewayOrder(
                        prep.getPaymentGroupId(),
                        prep.getAmountPaise(),
                        "INR",
                        customerId
                );
            } catch (Exception e) {
                log.error("Failed to create Razorpay order for paymentGroupId={}, running compensating transaction: {}",
                        prep.getPaymentGroupId(), e.getMessage());
                compensateOnlineCheckoutFailure(prep.getPaymentGroupId(), e.getMessage());
                paymentService.markFailed(prep.getPaymentGroupId(), e.getMessage());
                throw new PaymentGatewayException("Payment gateway is temporarily unavailable. Please try again later.", e);
            }

            paymentService.recordGatewayOrderId(prep.getPaymentGroupId(), gatewayOrder.id());

            List<OrderSummaryResponse> summaries = prep.getOrders().stream()
                    .map(this::mapToSummary)
                    .collect(Collectors.toList());

            return CheckoutResponse.builder()
                    .orders(summaries)
                    .payment(CheckoutPaymentDetails.builder()
                            .keyId(paymentService.getKeyId())
                            .razorpayOrderId(gatewayOrder.id())
                            .amountPaise(prep.getAmountPaise())
                            .currency("INR")
                            .expiresAt(prep.getPaymentExpiresAt())
                            .customerPrefill(CustomerPrefill.builder()
                                    .name(prep.getCustomer().getName())
                                    .email(prep.getCustomer().getEmail())
                                    .phone(prep.getCustomer().getPhone())
                                    .build())
                            .build())
                    .build();
        } else {
            return checkoutCod(customerId, request);
        }
    }

    @Transactional
    public PreparedOnlineCheckout checkoutOnlineStep1(Long customerId, CheckoutRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<CartItem> cartItems = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        if (cartItems.isEmpty()) {
            throw new CartEmptyException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address not found");
        }

        String paymentGroupId = UUID.randomUUID().toString();
        LocalDateTime paymentExpiresAt = LocalDateTime.now().plusMinutes(paymentService.getWindowMinutes());

        Map<Long, List<CartItem>> itemsByFarmer = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getFarmer().getId()));

        List<Order> createdOrders = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Map.Entry<Long, List<CartItem>> entry : itemsByFarmer.entrySet()) {
            Long farmerId = entry.getKey();
            List<CartItem> farmerItems = entry.getValue();

            User farmer = userRepository.findById(farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
            BigDecimal totalAmount = BigDecimal.ZERO;

            Order order = Order.builder()
                    .customer(customer)
                    .farmer(farmer)
                    .paymentMode(PaymentMode.ONLINE)
                    .paymentStatus(PaymentStatus.PENDING)
                    .status(OrderStatus.AWAITING_PAYMENT)
                    .paymentGroupId(paymentGroupId)
                    .paymentExpiresAt(paymentExpiresAt)
                    .refundStatus(RefundStatus.NONE)
                    .shipName(address.getFullName())
                    .shipPhone(address.getPhone())
                    .shipLine1(address.getLine1())
                    .shipCity(address.getCity())
                    .shipState(address.getState())
                    .shipPincode(address.getPincode())
                    .build();

            for (CartItem cItem : farmerItems) {
                Product p = cItem.getProduct();
                if (!p.isPubliclyVisible()) {
                    if (appMetricsService != null) appMetricsService.incrementCheckoutFailures("product_unavailable");
                    throw new ProductUnavailableException(p.getName() + " is no longer available.");
                }

                int updatedRows = productRepository.decreaseStock(p.getId(), cItem.getQuantity());
                if (updatedRows == 0) {
                    if (appMetricsService != null) appMetricsService.incrementCheckoutFailures("insufficient_stock");
                    throw new InsufficientStockException(p.getName() + ": not enough stock or product unavailable");
                }

                BigDecimal lineTotal = p.getPricePerUnit().multiply(cItem.getQuantity()).setScale(2, RoundingMode.HALF_UP);
                totalAmount = totalAmount.add(lineTotal);

                OrderItem orderItem = OrderItem.builder()
                        .product(p)
                        .productName(p.getName())
                        .unit(p.getUnit())
                        .imageUrl(p.getImageUrl())
                        .quantity(cItem.getQuantity())
                        .priceAtOrder(p.getPricePerUnit())
                        .lineTotal(lineTotal)
                        .build();

                order.addItem(orderItem);
            }

            order.setTotalAmount(totalAmount);
            grandTotal = grandTotal.add(totalAmount);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .status(OrderStatus.AWAITING_PAYMENT)
                    .changedByRole("SYSTEM")
                    .note("Awaiting payment")
                    .build();
            order.addHistory(history);

            Order savedOrder = orderRepository.save(order);
            createdOrders.add(savedOrder);

            if (appMetricsService != null) {
                appMetricsService.incrementOrdersPlaced("ONLINE");
                appMetricsService.incrementOrderStatusChanges(OrderStatus.AWAITING_PAYMENT.name());
            }
        }

        long amountPaise = grandTotal.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();

        paymentService.createPaymentRecord(paymentGroupId, customerId, amountPaise, "INR", paymentExpiresAt);

        cartItemRepository.deleteByCustomerId(customerId);

        return PreparedOnlineCheckout.builder()
                .paymentGroupId(paymentGroupId)
                .amountPaise(amountPaise)
                .paymentExpiresAt(paymentExpiresAt)
                .orders(createdOrders)
                .customer(customer)
                .build();
    }

    @Transactional
    public void compensateOnlineCheckoutFailure(String paymentGroupId, String reason) {
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
                        .changedByRole("SYSTEM")
                        .note("Payment gateway order creation failed: " + reason)
                        .build();
                order.addHistory(history);
                orderRepository.save(order);
                if (appMetricsService != null) {
                    appMetricsService.incrementOrderStatusChanges(OrderStatus.CANCELLED.name());
                }
            }
        }
    }

    @Transactional
    public CheckoutResponse checkoutCod(Long customerId, CheckoutRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        List<CartItem> cartItems = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        if (cartItems.isEmpty()) {
            throw new CartEmptyException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address not found");
        }

        Map<Long, List<CartItem>> itemsByFarmer = cartItems.stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getFarmer().getId()));

        List<Order> createdOrders = new ArrayList<>();

        for (Map.Entry<Long, List<CartItem>> entry : itemsByFarmer.entrySet()) {
            Long farmerId = entry.getKey();
            List<CartItem> farmerItems = entry.getValue();

            User farmer = userRepository.findById(farmerId)
                    .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));
            BigDecimal totalAmount = BigDecimal.ZERO;

            Order order = Order.builder()
                    .customer(customer)
                    .farmer(farmer)
                    .paymentMode(PaymentMode.COD)
                    .paymentStatus(PaymentStatus.PENDING)
                    .status(OrderStatus.PLACED)
                    .refundStatus(RefundStatus.NONE)
                    .shipName(address.getFullName())
                    .shipPhone(address.getPhone())
                    .shipLine1(address.getLine1())
                    .shipCity(address.getCity())
                    .shipState(address.getState())
                    .shipPincode(address.getPincode())
                    .build();

            for (CartItem cItem : farmerItems) {
                Product p = cItem.getProduct();
                if (!p.isPubliclyVisible()) {
                    if (appMetricsService != null) appMetricsService.incrementCheckoutFailures("product_unavailable");
                    throw new ProductUnavailableException(p.getName() + " is no longer available.");
                }

                BigDecimal previousStock = p.getQuantityAvailable();
                int updatedRows = productRepository.decreaseStock(p.getId(), cItem.getQuantity());
                if (updatedRows == 0) {
                    if (appMetricsService != null) appMetricsService.incrementCheckoutFailures("insufficient_stock");
                    throw new InsufficientStockException(p.getName() + ": not enough stock or product unavailable");
                }

                if (previousStock != null) {
                    BigDecimal remainingStock = previousStock.subtract(cItem.getQuantity());
                    if (previousStock.compareTo(new BigDecimal("5.00")) > 0
                            && remainingStock.compareTo(new BigDecimal("5.00")) <= 0) {
                        if (eventPublisher != null) {
                            eventPublisher.publishEvent(new LowStockDetectedEvent(
                                    p.getId(),
                                    farmer.getId(),
                                    p.getName(),
                                    remainingStock
                            ));
                        }
                    }
                }

                BigDecimal lineTotal = p.getPricePerUnit().multiply(cItem.getQuantity()).setScale(2, RoundingMode.HALF_UP);
                totalAmount = totalAmount.add(lineTotal);

                OrderItem orderItem = OrderItem.builder()
                        .product(p)
                        .productName(p.getName())
                        .unit(p.getUnit())
                        .imageUrl(p.getImageUrl())
                        .quantity(cItem.getQuantity())
                        .priceAtOrder(p.getPricePerUnit())
                        .lineTotal(lineTotal)
                        .build();

                order.addItem(orderItem);
            }

            order.setTotalAmount(totalAmount);

            OrderStatusHistory history = OrderStatusHistory.builder()
                    .status(OrderStatus.PLACED)
                    .changedByRole("CUSTOMER")
                    .note("Order placed (Cash on Delivery)")
                    .build();
            order.addHistory(history);

            Order savedOrder = orderRepository.save(order);
            createdOrders.add(savedOrder);

            if (appMetricsService != null) {
                appMetricsService.incrementOrdersPlaced("COD");
                appMetricsService.incrementOrderStatusChanges(OrderStatus.PLACED.name());
            }

            if (eventPublisher != null) {
                eventPublisher.publishEvent(new OrderPlacedEvent(savedOrder));
            }
        }

        cartItemRepository.deleteByCustomerId(customerId);

        List<OrderSummaryResponse> summaries = createdOrders.stream()
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return CheckoutResponse.builder()
                .orders(summaries)
                .build();
    }

    @Transactional
    public PageResponse<OrderSummaryResponse> myOrders(Long customerId, OrderStatus status, int page, int size) {
        paymentService.expirePendingOrders(LocalDateTime.now());

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findByCustomerId(customerId, pageable);

        List<OrderSummaryResponse> content = orderPage.getContent().stream()
                .filter(o -> status == null || o.getStatus() == status)
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    @Transactional
    public OrderResponse getMyOrder(Long customerId, Long orderId) {
        paymentService.expirePendingOrders(LocalDateTime.now());

        Order order = orderRepository.findWithItemsAndHistoryById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        return mapToResponse(order, true);
    }

    @Transactional
    public void cancel(Long customerId, Long orderId, CancelRequest request) {
        Order order = orderRepository.findWithItemsAndHistoryById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (order.getStatus() == OrderStatus.AWAITING_PAYMENT) {
            if (order.getPaymentGroupId() != null) {
                paymentService.cancelPaymentGroup(order.getPaymentGroupId(), request != null ? request.getReason() : "Customer cancelled");
            } else {
                cancelSingleOrder(order, request != null ? request.getReason() : "Customer cancelled");
            }
            return;
        }

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new InvalidStatusTransitionException("You can only cancel an order that is PLACED or AWAITING_PAYMENT.");
        }

        cancelSingleOrder(order, request != null ? request.getReason() : "Customer cancelled");
    }

    private void cancelSingleOrder(Order order, String reason) {
        int updated = orderRepository.updateStatusIfCurrentStatus(order.getId(), order.getStatus(), OrderStatus.CANCELLED);
        if (updated == 0) {
            throw new InvalidStatusTransitionException("Order is no longer in cancellable state");
        }

        order.setStatus(OrderStatus.CANCELLED);

        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .status(OrderStatus.CANCELLED)
                .changedByRole("CUSTOMER")
                .note(reason)
                .build();

        order.addHistory(history);
        orderRepository.save(order);
        if (appMetricsService != null) {
            appMetricsService.incrementOrderStatusChanges(OrderStatus.CANCELLED.name());
        }

        if (paymentService != null) {
            paymentService.processRefund(order, reason);
        }
    }

    public OrderSummaryResponse mapToSummary(Order order) {
        String firstItemName = "";
        String firstItemImage = "";
        if (!order.getItems().isEmpty()) {
            OrderItem first = order.getItems().get(0);
            firstItemName = first.getProductName();
            firstItemImage = first.getImageUrl();
        }

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .paymentMode(order.getPaymentMode())
                .paymentStatus(order.getPaymentStatus())
                .paymentGroupId(order.getPaymentGroupId())
                .paymentExpiresAt(order.getPaymentExpiresAt())
                .totalAmount(order.getTotalAmount())
                .itemCount(order.getItems().size())
                .firstItemName(firstItemName)
                .firstItemImageUrl(firstItemImage)
                .createdAt(order.getCreatedAt())
                .otherPartyName(order.getFarmer().getProfile() != null ? order.getFarmer().getProfile().getFarmName() : order.getFarmer().getName())
                .build();
    }

    public OrderResponse mapToResponse(Order order, boolean forCustomer) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct() != null ? item.getProduct().getId() : null)
                        .productName(item.getProductName())
                        .unit(item.getUnit())
                        .imageUrl(item.getImageUrl())
                        .quantity(item.getQuantity())
                        .priceAtOrder(item.getPriceAtOrder())
                        .lineTotal(item.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        List<OrderStatusHistoryResponse> historyResponses = order.getHistory().stream()
                .map(h -> OrderStatusHistoryResponse.builder()
                        .status(h.getStatus())
                        .note(h.getNote())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());

        OrderResponse.OrderResponseBuilder builder = OrderResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .paymentMode(order.getPaymentMode())
                .paymentStatus(order.getPaymentStatus())
                .paymentGroupId(order.getPaymentGroupId())
                .paymentExpiresAt(order.getPaymentExpiresAt())
                .refundStatus(order.getRefundStatus())
                .razorpayOrderId(order.getRazorpayOrderId())
                .refundAmount(order.getRefundAmount())
                .refundedAt(order.getRefundedAt())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                .shipName(order.getShipName())
                .shipPhone(order.getShipPhone())
                .shipLine1(order.getShipLine1())
                .shipCity(order.getShipCity())
                .shipState(order.getShipState())
                .shipPincode(order.getShipPincode())
                .items(itemResponses)
                .history(historyResponses);

        if (forCustomer) {
            builder.farmerName(order.getFarmer().getName());
            builder.farmName(order.getFarmer().getProfile() != null ? order.getFarmer().getProfile().getFarmName() : "");
            builder.farmerPhone(order.getFarmer().getPhone());

            if (order.getStatus() == OrderStatus.DELIVERED) {
                Optional<Review> reviewOpt = reviewRepository.findByOrderId(order.getId());
                if (reviewOpt.isEmpty()) {
                    builder.canReview(true);
                } else {
                    builder.canReview(false);
                    Review review = reviewOpt.get();

                    String[] parts = review.getCustomer().getFullName().trim().split("\\s+");
                    String reviewerName = parts.length == 1 ? parts[0] : parts[0] + " " + parts[parts.length - 1].substring(0, 1).toUpperCase() + ".";

                    ReviewResponse rr = ReviewResponse.builder()
                            .id(review.getId())
                            .rating(review.getRating())
                            .comment(review.getComment())
                            .reviewerName(reviewerName)
                            .createdAt(review.getCreatedAt())
                            .orderNumber(order.getId().toString())
                            .build();
                    builder.myReview(rr);
                }
            } else {
                builder.canReview(false);
            }
        } else {
            builder.customerName(order.getCustomer().getName());
            builder.customerPhone(order.getCustomer().getPhone());
        }

        return builder.build();
    }
}
