package com.kisanmandi.controller;

import com.kisanmandi.dto.FarmerReviewsResponse;
import com.kisanmandi.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Public Reviews", description = "Public reviews and feedback ratings for farmers")
@RestController
@RequestMapping("/api/farmers")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Get published reviews and ratings for a farmer")
    @GetMapping("/{farmerId}/reviews")
    public FarmerReviewsResponse getFarmerReviews(
            @PathVariable Long farmerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (size > 50) size = 50;
        return reviewService.getPublicFarmerReviews(farmerId, PageRequest.of(page, size));
    }
}
