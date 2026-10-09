package com.kisanmandi.dto.mandi;

import com.kisanmandi.entity.PriceSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MandiPriceResponse {
    private String state;
    private String district;
    private String market;
    private String commodity;
    private String variety;
    private String grade;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal modalPrice;
    private LocalDate priceDate;
    private PriceSource source;
}
