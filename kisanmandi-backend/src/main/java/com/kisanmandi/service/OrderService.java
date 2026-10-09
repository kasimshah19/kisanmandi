package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.CartEmptyException;
import com.kisanmandi.exception.InsufficientStockException;
import com.kisanmandi.exception.InvalidStatusTransitionException;
import com.kisanmandi.exception.ProductUnavailableException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.AddressRepository;
import com.kisanmandi.repository.CartItemRepository;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final com.kisanmandi.repository.ReviewRepository reviewRepository;

    @Transactional
    public List<OrderSummaryResponse> checkout(Long customerId, CheckoutRequest request) {
        List<CartItem> cartItems = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
        if (cartItems.isEmpty()) {
            throw new CartEmptyException("Cart is empty");
        }

        Address address = addressRepository.findById(request.getAddressId())
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Address not found");
        }

        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Group items by farmer
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
                    .paymentMode(request.getPaymentMode())
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
                    throw new ProductUnavailableException(p.getName() + " is no longer available.");
                }

                // Atomic stock check and decrease
                int updatedRows = productRepository.decreaseStock(p.getId(), cItem.getQuantity());
                if (updatedRows == 0) {
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
            
            OrderStatusHistory history = OrderStatusHistory.builder()
                    .status(OrderStatus.PLACED)
                    .changedByRole("CUSTOMER")
                    .note("Order placed")
                    .build();
            order.addHistory(history);

            createdOrders.add(orderRepository.save(order));
        }

        cartItemRepository.deleteByCustomerId(customerId);

        return createdOrders.stream().map(this::mapToSummary).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> myOrders(Long customerId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Order> orderPage;
        // In Phase 3, we don't have a status filter on customer side repo yet (as per req, farmer has it),
        // but let's implement it if passed just in case, or ignore. The req said:
        // CustomerOrderController /api/customer/orders: GET (?status=&page=&size=)
        // I will implement a filter if needed, but let's just get all for customer if status is null.
        // Wait, I only added `findByCustomerId` in repo without status. Let me fetch all and let the user see them.
        // I will just use `findByCustomerId`.
        orderPage = orderRepository.findByCustomerId(customerId, pageable);

        List<OrderSummaryResponse> content = orderPage.getContent().stream()
                .filter(o -> status == null || o.getStatus() == status)
                .map(this::mapToSummary)
                .collect(Collectors.toList());

        return new PageResponse<OrderSummaryResponse>(
                content,
                orderPage.getNumber(),
                orderPage.getSize(),
                orderPage.getTotalElements(),
                orderPage.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public OrderResponse getMyOrder(Long customerId, Long orderId) {
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

        if (order.getStatus() != OrderStatus.PLACED) {
            throw new InvalidStatusTransitionException("You can only cancel an order that is PLACED.");
        }

        order.setStatus(OrderStatus.CANCELLED);

        // Restore stock
        for (OrderItem item : order.getItems()) {
            if (item.getProduct() != null) {
                productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        OrderStatusHistory history = OrderStatusHistory.builder()
                .status(OrderStatus.CANCELLED)
                .changedByRole("CUSTOMER")
                .note(request != null ? request.getReason() : null)
                .build();
        
        order.addHistory(history);
        orderRepository.save(order);
    }

    private OrderSummaryResponse mapToSummary(Order order) {
        String firstItemName = "";
        String firstItemImage = "";
        if (!order.getItems().isEmpty()) {
            OrderItem firstItem = order.getItems().get(0);
            firstItemName = firstItem.getProductName();
            firstItemImage = firstItem.getImageUrl();
        }

        return OrderSummaryResponse.builder()
                .id(order.getId())
                .status(order.getStatus())
                .totalAmount(order.getTotalAmount())
                .itemCount(order.getItems().size())
                .firstItemName(firstItemName)
                .firstItemImageUrl(firstItemImage)
                .createdAt(order.getCreatedAt())
                .otherPartyName(order.getFarmer().getProfile() != null ? order.getFarmer().getProfile().getFarmName() : order.getFarmer().getName())
                .build();
    }

    private OrderResponse mapToResponse(Order order, boolean forCustomer) {
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
                java.util.Optional<Review> reviewOpt = reviewRepository.findByOrderId(order.getId());
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
