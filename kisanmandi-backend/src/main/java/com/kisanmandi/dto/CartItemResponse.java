package com.kisanmandi.dto;

import com.kisanmandi.entity.ProductUnit;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String name;
    private String imageUrl;
    private ProductUnit unit;
    private BigDecimal pricePerUnit;
    private BigDecimal quantity;
    private BigDecimal lineTotal;
    private BigDecimal availableStock;
    private Long farmerId;
    private String farmerName;
    private String farmName;
    private boolean available;
    private String unavailableReason;
}
