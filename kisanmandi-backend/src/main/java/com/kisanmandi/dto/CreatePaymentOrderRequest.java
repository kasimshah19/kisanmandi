package com.kisanmandi.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentOrderRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;
}
