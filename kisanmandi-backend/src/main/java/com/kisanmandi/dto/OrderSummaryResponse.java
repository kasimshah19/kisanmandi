package com.kisanmandi.dto;

import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.entity.PaymentMode;
import com.kisanmandi.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class OrderSummaryResponse {
    private Long id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private int itemCount;
    private String firstItemName;
    private String firstItemImageUrl;
    private LocalDateTime createdAt;
    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private String paymentGroupId;
    private LocalDateTime paymentExpiresAt;
    
    // other party's name (farmer name for customer view, customer name for farmer view)
    private String otherPartyName;
}
