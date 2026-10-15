package com.kisanmandi.service;

import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.OrderStatusUpdateRequest;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.InvalidStatusTransitionException;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderStatusTransitionsTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private FarmerOrderService farmerOrderService;

    @InjectMocks
    private OrderService customerOrderService;

    private User farmer;
    private User customer;
    private Product product;
    private Order order;

    @BeforeEach
    void setUp() {
        farmer = User.builder().id(10L).role(Role.FARMER).build();
        customer = User.builder().id(1L).role(Role.CUSTOMER).build();
        product = Product.builder().id(100L).farmer(farmer).build();

        OrderItem item = OrderItem.builder()
                .id(500L)
                .product(product)
                .quantity(new BigDecimal("5.00"))
                .build();

        order = Order.builder()
                .id(1000L)
                .farmer(farmer)
                .customer(customer)
                .status(OrderStatus.PLACED)
                .items(new ArrayList<>(List.of(item)))
                .history(new ArrayList<>())
                .build();

        lenient().when(orderRepository.updateStatusIfCurrentStatus(anyLong(), any(), any())).thenReturn(1);
    }

    @Test
    void farmerFlow_allowedTransitions_pass() {
        when(orderRepository.findWithItemsAndHistoryById(1000L)).thenReturn(Optional.of(order));

        // PLACED -> ACCEPTED
        OrderStatusUpdateRequest req1 = new OrderStatusUpdateRequest();
        req1.setStatus(OrderStatus.ACCEPTED);
        farmerOrderService.updateStatus(10L, 1000L, req1);
        assertEquals(OrderStatus.ACCEPTED, order.getStatus());

        // ACCEPTED -> PACKED
        OrderStatusUpdateRequest req2 = new OrderStatusUpdateRequest();
        req2.setStatus(OrderStatus.PACKED);
        farmerOrderService.updateStatus(10L, 1000L, req2);
        assertEquals(OrderStatus.PACKED, order.getStatus());

        // PACKED -> OUT_FOR_DELIVERY
        OrderStatusUpdateRequest req3 = new OrderStatusUpdateRequest();
        req3.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        farmerOrderService.updateStatus(10L, 1000L, req3);
        assertEquals(OrderStatus.OUT_FOR_DELIVERY, order.getStatus());

        // OUT_FOR_DELIVERY -> DELIVERED
        OrderStatusUpdateRequest req4 = new OrderStatusUpdateRequest();
        req4.setStatus(OrderStatus.DELIVERED);
        farmerOrderService.updateStatus(10L, 1000L, req4);
        assertEquals(OrderStatus.DELIVERED, order.getStatus());
    }

    @Test
    void farmerFlow_invalidTransition_throwsException() {
        when(orderRepository.findWithItemsAndHistoryById(1000L)).thenReturn(Optional.of(order));

        // PLACED -> PACKED (illegal jump)
        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest();
        req.setStatus(OrderStatus.PACKED);

        assertThrows(InvalidStatusTransitionException.class, () -> farmerOrderService.updateStatus(10L, 1000L, req));
    }

    @Test
    void farmerFlow_terminalState_cannotBeUpdated() {
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findWithItemsAndHistoryById(1000L)).thenReturn(Optional.of(order));

        OrderStatusUpdateRequest req = new OrderStatusUpdateRequest();
        req.setStatus(OrderStatus.CANCELLED);

        assertThrows(InvalidStatusTransitionException.class, () -> farmerOrderService.updateStatus(10L, 1000L, req));
    }

    @Test
    void farmerReject_requiresNote_andRestoresStock() {
        when(orderRepository.findWithItemsAndHistoryById(1000L)).thenReturn(Optional.of(order));

        // Reject without note should fail
        OrderStatusUpdateRequest reqWithoutNote = new OrderStatusUpdateRequest();
        reqWithoutNote.setStatus(OrderStatus.REJECTED);
        assertThrows(IllegalArgumentException.class, () -> farmerOrderService.updateStatus(10L, 1000L, reqWithoutNote));

        // Reject with note should succeed and restore stock
        OrderStatusUpdateRequest reqWithNote = new OrderStatusUpdateRequest();
        reqWithNote.setStatus(OrderStatus.REJECTED);
        reqWithNote.setNote("Item out of season");

        farmerOrderService.updateStatus(10L, 1000L, reqWithNote);

        assertEquals(OrderStatus.REJECTED, order.getStatus());
        verify(productRepository).increaseStock(100L, new BigDecimal("5.00"));
    }

    @Test
    void customerCancel_onlyAllowedWhenPlaced_andRestoresStock() {
        when(orderRepository.findWithItemsAndHistoryById(1000L)).thenReturn(Optional.of(order));

        // When order is PLACED, customer can cancel
        CancelRequest cancelReq = new CancelRequest();
        cancelReq.setReason("Changed mind");
        customerOrderService.cancel(1L, 1000L, cancelReq);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(productRepository).increaseStock(100L, new BigDecimal("5.00"));

        // When order is ACCEPTED, cancellation must throw
        order.setStatus(OrderStatus.ACCEPTED);
        assertThrows(InvalidStatusTransitionException.class, () -> customerOrderService.cancel(1L, 1000L, cancelReq));
    }
}
