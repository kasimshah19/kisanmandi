package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutPaymentDetails {
    private String keyId;
    private String razorpayOrderId;
    private Long amountPaise;
    private String currency;
    private LocalDateTime expiresAt;
    private CustomerPrefill customerPrefill;
}

