package com.kisanmandi.event;

import com.kisanmandi.entity.ApprovalStatus;

public record FarmerApprovalChangedEvent(
        Long farmerId,
        ApprovalStatus status,
        String reason
) {}

