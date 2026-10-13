package com.kisanmandi.controller;

import com.kisanmandi.dto.ReviewRequest;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer Reviews", description = "Customer reviews and feedback on delivered orders")
@RestController
@RequestMapping("/api/customer/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerReviewController {

    private final ReviewService reviewService;
    private final UserRepository userRepository;

    @Operation(summary = "Submit a rating and review for a delivered order")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Review submitted successfully"),
            @ApiResponse(responseCode = "400", description = "Validation error or order not delivered"),
            @ApiResponse(responseCode = "404", description = "Order not found"),
            @ApiResponse(responseCode = "409", description = "Order has already been reviewed")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createReview(
            Authentication authentication,
            @Valid @RequestBody ReviewRequest request,
            @RequestParam Long orderId) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        reviewService.createReview(user.getId(), orderId, request);
    }
}
