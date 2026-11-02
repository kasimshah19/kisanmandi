package com.kisanmandi.event;

public record PasswordChangedEvent(Long userId, String email, String requestId) {
}

