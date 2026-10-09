package com.kisanmandi.dto;

import com.kisanmandi.entity.ProductUnit;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private ProductUnit unit;
    private String imageUrl;
    private BigDecimal quantity;
    private BigDecimal priceAtOrder;
    private BigDecimal lineTotal;
}
