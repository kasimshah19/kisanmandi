package com.kisanmandi.dto;

import com.kisanmandi.entity.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class OrderStatusHistoryResponse {
    private OrderStatus status;
    private String note;
    private LocalDateTime changedAt;
}
