package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.InvalidStatusTransitionException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FarmerOrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public PageResponse<OrderSummaryResponse> list(Long farmerId, OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        Page<Order> orderPage;
        if (status != null) {
            orderPage = orderRepository.findByFarmerIdAndStatus(farmerId, status, pageable);
        } else {
            orderPage = orderRepository.findByFarmerId(farmerId, pageable);
        }

        List<OrderSummaryResponse> content = orderPage.getContent().stream()
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
    public OrderResponse get(Long farmerId, Long orderId) {
        Order order = orderRepository.findWithItemsAndHistoryById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getFarmer().getId().equals(farmerId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        return mapToResponse(order);
    }

    @Transactional
    public void updateStatus(Long farmerId, Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findWithItemsAndHistoryById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getFarmer().getId().equals(farmerId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        OrderStatus current = order.getStatus();
        OrderStatus target = request.getStatus();

        if (current == OrderStatus.DELIVERED || current == OrderStatus.REJECTED || current == OrderStatus.CANCELLED) {
            throw new InvalidStatusTransitionException("Order is in a terminal state: " + current);
        }

        boolean valid = false;
        switch (current) {
            case PLACED:
                if (target == OrderStatus.ACCEPTED || target == OrderStatus.REJECTED) valid = true;
                break;
            case ACCEPTED:
                if (target == OrderStatus.PACKED) valid = true;
                break;
            case PACKED:
                if (target == OrderStatus.OUT_FOR_DELIVERY) valid = true;
                break;
            case OUT_FOR_DELIVERY:
                if (target == OrderStatus.DELIVERED) valid = true;
                break;
            default:
                break;
        }

        if (!valid) {
            throw new InvalidStatusTransitionException("Invalid status jump from " + current + " to " + target);
        }

        if (target == OrderStatus.REJECTED) {
            if (request.getNote() == null || request.getNote().trim().isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            // Restore stock
            for (OrderItem item : order.getItems()) {
                if (item.getProduct() != null) {
                    productRepository.increaseStock(item.getProduct().getId(), item.getQuantity());
                }
            }
        }

        if (target == OrderStatus.DELIVERED && order.getPaymentMode() == PaymentMode.COD) {
            order.setPaymentStatus(PaymentStatus.PAID);
        }

        order.setStatus(target);

        OrderStatusHistory history = OrderStatusHistory.builder()
                .status(target)
                .changedByRole("FARMER")
                .note(request.getNote())
                .build();
        
        order.addHistory(history);
        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public OrderCountsResponse counts(Long farmerId) {
        return OrderCountsResponse.builder()
                .placed(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.PLACED))
                .accepted(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.ACCEPTED))
                .packed(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.PACKED))
                .outForDelivery(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.OUT_FOR_DELIVERY))
                .delivered(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED))
                .rejected(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.REJECTED))
                .cancelled(orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.CANCELLED))
                .build();
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
                .otherPartyName(order.getCustomer().getName())
                .build();
    }

    private OrderResponse mapToResponse(Order order) {
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

        return OrderResponse.builder()
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
                .history(historyResponses)
                .customerName(order.getCustomer().getName())
                .customerPhone(order.getCustomer().getPhone())
                .build();
    }
}
