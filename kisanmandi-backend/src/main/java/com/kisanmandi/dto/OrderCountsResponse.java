package com.kisanmandi.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderCountsResponse {
    private long placed;
    private long accepted;
    private long packed;
    private long outForDelivery;
    private long delivered;
    private long rejected;
    private long cancelled;
}
