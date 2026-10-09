package com.kisanmandi.controller;

import org.springframework.security.core.Authentication;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.dto.ReviewRequest;
import com.kisanmandi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerReviewController {
    
    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createReview(
            Authentication authentication,
            @RequestBody ReviewRequest request,
            @RequestParam Long orderId) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        reviewService.createReview(user.getId(), orderId, request);
    }

    // @GetMapping("/pending") will be implemented in OrderService to fetch orders
}
