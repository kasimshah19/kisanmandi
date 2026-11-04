package com.kisanmandi.event;

import com.kisanmandi.entity.Order;
import com.kisanmandi.entity.OrderStatus;

public record OrderStatusChangedEvent(
        Long orderId,
        Order order,
        OrderStatus from,
        OrderStatus to,
        String actorRole,
        String note
) {}
