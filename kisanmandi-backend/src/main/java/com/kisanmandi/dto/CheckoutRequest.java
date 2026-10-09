package com.kisanmandi.dto;

import com.kisanmandi.entity.PaymentMode;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequest {
    @NotNull(message = "Address ID is required")
    private Long addressId;

    private PaymentMode paymentMode = PaymentMode.COD;
}
