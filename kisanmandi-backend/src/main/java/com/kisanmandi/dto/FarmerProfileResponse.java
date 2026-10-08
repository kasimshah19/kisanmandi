package com.kisanmandi.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FarmerProfileResponse {
    private Long id;
    private Long farmerId;
    private String farmerName;
    private String farmerEmail;
    private String farmerPhone;

    private String farmName;
    private String village;
    private String district;
    private String state;
    private String pincode;
    
    private Double latitude;
    private Double longitude;

    private boolean hasDocument;
    private String approvalStatus; // can be NOT_SUBMITTED, PENDING, APPROVED, REJECTED
    private String rejectionReason;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;
}
