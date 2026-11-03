package com.kisanmandi.event;

public record PasswordChangedEvent(
        Long userId,
        String email,
        String recipientName,
        String lang,
        String requestId
) {
    public PasswordChangedEvent(Long userId, String email, String requestId) {
        this(userId, email, null, "en", requestId);
    }
}
