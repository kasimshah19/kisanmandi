package com.kisanmandi.service;

import com.kisanmandi.dto.ReviewRequest;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ReviewRepository;
import com.kisanmandi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User customer;
    private User farmer;
    private Order order;
    private FarmerProfile farmerProfile;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).email("c@test.com").name("Kasim Shah").build();
        farmer = User.builder().id(10L).email("f@test.com").name("Farmer").build();
        farmerProfile = FarmerProfile.builder().id(100L).user(farmer).ratingAvg(BigDecimal.ZERO).ratingCount(0).build();

        order = Order.builder()
                .id(500L)
                .customer(customer)
                .farmer(farmer)
                .status(OrderStatus.DELIVERED)
                .build();
    }

    @Test
    void createReview_onlyDeliveredAllowed() {
        order.setStatus(OrderStatus.PLACED);
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        ReviewRequest req = new ReviewRequest();
        req.setRating(5);
        req.setComment("Great products");

        assertThrows(IllegalStateException.class, () -> reviewService.createReview(1L, 500L, req));
        verify(reviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void createReview_otherUsersOrder_rejected() {
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        ReviewRequest req = new ReviewRequest();
        req.setRating(5);

        assertThrows(ResourceNotFoundException.class, () -> reviewService.createReview(999L, 500L, req));
        verify(reviewRepository, never()).saveAndFlush(any());
    }

    @Test
    void createReview_oneReviewPerOrder_throwsIfDuplicate() {
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(reviewRepository.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("Duplicate key"));

        ReviewRequest req = new ReviewRequest();
        req.setRating(5);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> reviewService.createReview(1L, 500L, req));
        assertTrue(ex.getMessage().contains("Already reviewed"));
    }

    @Test
    void createReview_ratingBoundsChecked() {
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));

        ReviewRequest reqZero = new ReviewRequest();
        reqZero.setRating(0);
        assertThrows(IllegalArgumentException.class, () -> reviewService.createReview(1L, 500L, reqZero));

        ReviewRequest reqSix = new ReviewRequest();
        reqSix.setRating(6);
        assertThrows(IllegalArgumentException.class, () -> reviewService.createReview(1L, 500L, reqSix));
    }

    @Test
    void createReview_htmlEscapedInComment() {
        when(orderRepository.findById(500L)).thenReturn(Optional.of(order));
        when(farmerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(farmerProfile));
        when(reviewRepository.countVisibleReviewsForFarmer(10L)).thenReturn(1);
        when(reviewRepository.getAverageRatingForFarmer(10L)).thenReturn(Optional.of(5.0));

        ReviewRequest req = new ReviewRequest();
        req.setRating(5);
        req.setComment("<script>alert('hack')</script> Good tomatoes!");

        reviewService.createReview(1L, 500L, req);

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).saveAndFlush(captor.capture());

        Review saved = captor.getValue();
        assertFalse(saved.getComment().contains("<script>"));
        assertTrue(saved.getComment().contains("&lt;script&gt;"));
    }

    @Test
    void recalculateFarmerRating_updatesAverageAndCount() {
        when(farmerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(farmerProfile));
        when(reviewRepository.countVisibleReviewsForFarmer(10L)).thenReturn(2);
        when(reviewRepository.getAverageRatingForFarmer(10L)).thenReturn(Optional.of(4.5));

        reviewService.recalculateFarmerRating(10L);

        assertEquals(2, farmerProfile.getRatingCount());
        assertEquals(new BigDecimal("4.50"), farmerProfile.getRatingAvg());
        verify(farmerProfileRepository).save(farmerProfile);
    }

    @Test
    void recalculateFarmerRating_zeroReviews_resetsToZero() {
        farmerProfile.setRatingCount(5);
        farmerProfile.setRatingAvg(new BigDecimal("4.00"));

        when(farmerProfileRepository.findByUserId(10L)).thenReturn(Optional.of(farmerProfile));
        when(reviewRepository.countVisibleReviewsForFarmer(10L)).thenReturn(0);

        reviewService.recalculateFarmerRating(10L);

        assertEquals(0, farmerProfile.getRatingCount());
        assertEquals(BigDecimal.ZERO, farmerProfile.getRatingAvg());
        verify(farmerProfileRepository).save(farmerProfile);
    }

    @Test
    void maskName_masksCustomerFullNameCorrectly() {
        assertEquals("Kasim S.", reviewService.maskName("Kasim Shah"));
        assertEquals("Ramesh", reviewService.maskName("Ramesh"));
        assertEquals("Anonymous", reviewService.maskName(null));
        assertEquals("Anonymous", reviewService.maskName("   "));
        assertEquals("John D.", reviewService.maskName("John Mid Doe"));
    }
}
