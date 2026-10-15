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
public class ReviewResponse {
    private Long id;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private String customerName;
    private String productName;
    private LocalDateTime createdAt;
    private String orderNumber;
    private boolean hidden;
    private String hiddenReason;

    public String getCustomerName() {
        return customerName != null ? customerName : reviewerName;
    }
}
