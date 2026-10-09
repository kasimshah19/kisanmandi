package com.kisanmandi.dto.mandi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ComparePoint {
    private String market;
    private String district;
    private BigDecimal modalPrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}
