package com.kisanmandi.service;

import com.kisanmandi.dto.CancelRequest;
import com.kisanmandi.dto.HideRequest;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.InvalidStatusTransitionException;
import com.kisanmandi.repository.*;
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
class AdminServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private FarmerProfileRepository farmerProfileRepository;
    @Mock
    private ReviewService reviewService;

    @InjectMocks
    private AdminService adminService;

    private User farmer;
    private Review review;
    private Order order;
    private Product product;

    @BeforeEach
    void setUp() {
        farmer = User.builder().id(10L).email("farmer@test.com").name("Farmer One").build();

        review = Review.builder()
                .id(1L)
                .farmer(farmer)
                .rating(5)
                .comment("Great produce")
                .hidden(false)
                .build();

        product = Product.builder()
                .id(101L)
                .name("Wheat")
                .quantityAvailable(new BigDecimal("10.0"))
                .build();

        OrderItem item = OrderItem.builder()
                .product(product)
                .quantity(new BigDecimal("2.0"))
                .build();

        order = Order.builder()
                .id(500L)
                .status(OrderStatus.PLACED)
                .items(new ArrayList<>(List.of(item)))
                .build();

        lenient().when(orderRepository.updateStatusIfCurrentStatusIn(anyLong(), any(), any())).thenReturn(1);
    }

    @Test
    void hideReview_recalculatesFarmerRating() {
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        HideRequest req = new HideRequest();
        req.setReason("Inappropriate language");
        adminService.hideReview(1L, req);

        assertTrue(review.isHidden());
        assertEquals("Inappropriate language", review.getHiddenReason());
        verify(reviewService, times(1)).recalculateFarmerRating(10L);
    }

    @Test
    void unhideReview_recalculatesFarmerRating() {
        review.setHidden(true);
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        adminService.unhideReview(1L);

        assertFalse(review.isHidden());
        assertNull(review.getHiddenReason());
        verify(reviewService, times(1)).recalculateFarmerRating(10L);
    }

    @Test
    void cancelOrder_restoresStockAndCancels() {
        when(orderRepository.findWithItemsAndHistoryById(500L)).thenReturn(Optional.of(order));

        CancelRequest req = new CancelRequest();
        req.setReason("Admin cancelled order");
        adminService.cancelOrder(500L, req);

        assertEquals(OrderStatus.CANCELLED, order.getStatus());
        verify(productRepository, times(1)).increaseStock(101L, new BigDecimal("2.0"));
    }

    @Test
    void cancelOrder_throwsWhenAlreadyCancelled() {
        order.setStatus(OrderStatus.CANCELLED);
        when(orderRepository.findWithItemsAndHistoryById(500L)).thenReturn(Optional.of(order));

        CancelRequest req = new CancelRequest();
        req.setReason("reason");
        assertThrows(InvalidStatusTransitionException.class, () ->
                adminService.cancelOrder(500L, req));
    }

    @Test
    void cancelOrder_throwsWhenDelivered() {
        order.setStatus(OrderStatus.DELIVERED);
        when(orderRepository.findWithItemsAndHistoryById(500L)).thenReturn(Optional.of(order));

        CancelRequest req = new CancelRequest();
        req.setReason("reason");
        assertThrows(InvalidStatusTransitionException.class, () ->
                adminService.cancelOrder(500L, req));
    }
}
