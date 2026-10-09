package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerReviewsResponse;
import com.kisanmandi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    @GetMapping("/{farmerId}/reviews")
    public FarmerReviewsResponse getFarmerReviews(
            @PathVariable Long farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (size > 50) size = 50;
        return reviewService.getPublicFarmerReviews(farmerId, PageRequest.of(page, size));
    }
}
