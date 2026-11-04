package com.kisanmandi.event;

import com.kisanmandi.entity.Review;

public record ReviewCreatedEvent(
        Long reviewId,
        Long orderId,
        Long farmerId,
        Long customerId,
        String customerName,
        int rating,
        String comment,
        Review review
) {}

