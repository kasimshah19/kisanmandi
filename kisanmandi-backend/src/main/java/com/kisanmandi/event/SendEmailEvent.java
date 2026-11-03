package com.kisanmandi.event;

public record SendEmailEvent(
        EmailType type,
        String toEmail,
        String recipientName,
        String link,
        String lang
) {
}

