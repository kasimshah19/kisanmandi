package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ReviewRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    @Transactional
    public void createReview(Long customerId, Long orderId, ReviewRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Order not found");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new IllegalStateException("You can review only delivered orders");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        String safeComment = request.getComment() != null ? HtmlUtils.htmlEscape(request.getComment().trim()) : null;
        if (safeComment != null && safeComment.length() > 500) {
            safeComment = safeComment.substring(0, 500);
        }

        Review review = Review.builder()
                .order(order)
                .customer(order.getCustomer())
                .farmer(order.getFarmer())
                .rating(request.getRating())
                .comment(safeComment)
                .hidden(false)
                .build();

        try {
            reviewRepository.saveAndFlush(review);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Already reviewed");
        }

        recalculateFarmerRating(order.getFarmer().getId());
    }

    @Transactional
    public void recalculateFarmerRating(Long farmerId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        int count = reviewRepository.countVisibleReviewsForFarmer(farmerId);
        if (count == 0) {
            profile.setRatingAvg(BigDecimal.ZERO);
            profile.setRatingCount(0);
        } else {
            Double avg = reviewRepository.getAverageRatingForFarmer(farmerId).orElse(0.0);
            profile.setRatingAvg(BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP));
            profile.setRatingCount(count);
        }
        farmerProfileRepository.save(profile);
    }

    private String maskName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) return "Anonymous";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) return parts[0];
        return parts[0] + " " + parts[parts.length - 1].substring(0, 1).toUpperCase() + ".";
    }

    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .reviewerName(maskName(review.getCustomer().getFullName()))
                .createdAt(review.getCreatedAt())
                .orderNumber(review.getOrder().getId().toString())
                .build();
    }

    @Transactional(readOnly = true)
    public FarmerReviewsResponse getPublicFarmerReviews(Long farmerId, Pageable pageable) {
        User farmer = userRepository.findById(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found"));

        if (farmer.getStatus() != UserStatus.ACTIVE || farmer.getProfile() == null || farmer.getProfile().getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw new ResourceNotFoundException("Farmer not found");
        }

        Page<ReviewResponse> reviews = reviewRepository.findPublicByFarmerId(farmerId, pageable)
                .map(this::mapToResponse);

        return new FarmerReviewsResponse(getRatingSummary(farmerId), reviews);
    }

    @Transactional(readOnly = true)
    public FarmerReviewsResponse getFarmerOwnReviews(Long farmerId, Pageable pageable) {
        Page<ReviewResponse> reviews = reviewRepository.findByFarmerId(farmerId, pageable)
                .map(this::mapToResponse);

        return new FarmerReviewsResponse(getRatingSummary(farmerId), reviews);
    }

    private RatingSummaryResponse getRatingSummary(Long farmerId) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(farmerId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));

        List<Object[]> distRaw = reviewRepository.getRatingDistributionForFarmer(farmerId);
        Map<Integer, Long> distribution = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            distribution.put(i, 0L);
        }
        for (Object[] row : distRaw) {
            distribution.put((Integer) row[0], (Long) row[1]);
        }

        return RatingSummaryResponse.builder()
                .ratingAvg(profile.getRatingAvg())
                .ratingCount(profile.getRatingCount())
                .distribution(distribution)
                .build();
    }
}
