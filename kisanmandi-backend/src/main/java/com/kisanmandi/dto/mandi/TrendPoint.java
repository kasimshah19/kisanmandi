package com.kisanmandi.dto.mandi;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendPoint {
    private LocalDate date;
    private BigDecimal avgModal;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private long marketCount;

    public TrendPoint(LocalDate date, Double avgModal, BigDecimal minPrice, BigDecimal maxPrice, Long marketCount) {
        this.date = date;
        this.avgModal = avgModal != null ? BigDecimal.valueOf(avgModal) : null;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.marketCount = marketCount != null ? marketCount : 0L;
    }
}
