package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FarmerReviewsResponse {
    private RatingSummaryResponse summary;
    private Page<ReviewResponse> reviews;
}
