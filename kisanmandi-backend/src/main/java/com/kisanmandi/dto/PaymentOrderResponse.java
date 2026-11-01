package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private Long orderId;
    private String razorpayOrderId;
    private BigDecimal amount;
    private String currency;
    private String keyId;
}
