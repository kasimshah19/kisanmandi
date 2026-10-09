package com.kisanmandi.dto.mandi;

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
public class CommoditySummaryResponse {
    private String commodity;
    private LocalDate priceDate;
    private BigDecimal avgModal;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private long marketCount;
    private BigDecimal previousAvgModal;
    private BigDecimal changePercent;
    private String scopeUsed; // "DISTRICT", "STATE", "ALL"
}
