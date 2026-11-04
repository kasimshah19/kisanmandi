package com.kisanmandi.event;

import com.kisanmandi.entity.Order;

public record OrderPlacedEvent(Order order) {}
