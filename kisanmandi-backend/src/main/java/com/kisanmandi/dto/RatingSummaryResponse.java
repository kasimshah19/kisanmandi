package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RatingSummaryResponse {
    private BigDecimal ratingAvg;
    private int ratingCount;
    private Map<Integer, Long> distribution;
}
