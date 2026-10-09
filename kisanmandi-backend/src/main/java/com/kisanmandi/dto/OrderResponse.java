package com.kisanmandi.dto;

import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.entity.PaymentMode;
import com.kisanmandi.entity.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private OrderStatus status;
    private PaymentMode paymentMode;
    private PaymentStatus paymentStatus;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    
    // Address snapshot
    private String shipName;
    private String shipPhone;
    private String shipLine1;
    private String shipCity;
    private String shipState;
    private String shipPincode;

    private List<OrderItemResponse> items;
    private List<OrderStatusHistoryResponse> history;

    // customerName/customerPhone (for farmer view)
    private String customerName;
    private String customerPhone;

    // farmerName/farmName/farmerPhone (for customer view)
    private String farmerName;
    private String farmName;
    private String farmerPhone;
}
