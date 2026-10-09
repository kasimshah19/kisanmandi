package com.kisanmandi.dto;

import com.kisanmandi.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "Status is required")
    private OrderStatus status;

    @Size(max = 300, message = "Note cannot exceed 300 characters")
    private String note;
}
