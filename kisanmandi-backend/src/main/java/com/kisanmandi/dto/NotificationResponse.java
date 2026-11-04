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
public class NotificationResponse {
    private Long id;
    private String type;
    private String titleKey;
    private String bodyKey;
    private String paramsJson;
    private String fallbackText;
    private String link;
    private boolean read;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;

    // Backward-compatible getters for legacy consumers
    public String getTitle() {
        return fallbackText != null ? fallbackText : titleKey;
    }

    public String getMessage() {
        return fallbackText != null ? fallbackText : bodyKey;
    }

    public String getReferenceId() {
        return link;
    }
}
