package com.kisanmandi.controller;

import org.springframework.security.core.Authentication;
import com.kisanmandi.dto.FarmerReviewsResponse;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Farmer Reviews", description = "Farmer rating history and customer feedback reviews")
@RestController
@RequestMapping("/api/farmer/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('FARMER')")
public class FarmerReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @Operation(summary = "Get ratings and reviews received by the authenticated farmer")
    @GetMapping
    public FarmerReviewsResponse getMyReviews(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (size > 50) size = 50;
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return reviewService.getFarmerOwnReviews(user.getId(), PageRequest.of(page, size));
    }
}
