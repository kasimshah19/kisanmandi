package com.kisanmandi.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentVerificationRequest {

    @JsonAlias({"order_id", "orderId"})
    private Long orderId;

    @JsonAlias({"payment_group_id", "paymentGroupId"})
    private String paymentGroupId;

    @NotBlank(message = "Razorpay order ID is required")
    @JsonAlias({"razorpay_order_id", "razorpayOrderId"})
    @JsonProperty("razorpay_order_id")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required")
    @JsonAlias({"razorpay_payment_id", "razorpayPaymentId"})
    @JsonProperty("razorpay_payment_id")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    @JsonAlias({"razorpay_signature", "razorpaySignature"})
    @JsonProperty("razorpay_signature")
    private String razorpaySignature;

    public PaymentVerificationRequest(Long orderId, String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        this.orderId = orderId;
        this.razorpayOrderId = razorpayOrderId;
        this.razorpayPaymentId = razorpayPaymentId;
        this.razorpaySignature = razorpaySignature;
    }
}
