package com.kisanmandi.dto;

import com.kisanmandi.entity.ProductUnit;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long id;
    private String name;
    private String description;
    
    private Long categoryId;
    private String categoryName;
    
    private BigDecimal pricePerUnit;
    private ProductUnit unit;
    private BigDecimal quantityAvailable;
    
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
    
    private Long farmerId;
    private String farmerName;
    private String farmName;
    private String village;
    private String district;
}
