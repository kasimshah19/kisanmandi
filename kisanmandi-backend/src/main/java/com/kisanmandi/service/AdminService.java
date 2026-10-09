package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder().build();
    }

    @Transactional
    public void blockUser(Long userId, BlockRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
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
    }

    @Transactional
    public void unhideReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setHidden(false);
        review.setHiddenReason(null);
        reviewRepository.save(review);
    }
}
