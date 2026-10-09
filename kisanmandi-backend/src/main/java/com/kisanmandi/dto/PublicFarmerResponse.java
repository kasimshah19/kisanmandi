package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PublicFarmerResponse {
    private Long id;
    private String name;
    private String farmName;
    private String village;
    private String district;
    private String state;
    
    private BigDecimal ratingAvg;
    private int ratingCount;

    private LocalDateTime joinedAt;
}
