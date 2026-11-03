package com.kisanmandi.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicConfigResponse {
    private boolean emailEnabled;
    private boolean requireVerifiedEmail;
    private boolean paymentEnabled;
    private String razorpayKeyId;
}
