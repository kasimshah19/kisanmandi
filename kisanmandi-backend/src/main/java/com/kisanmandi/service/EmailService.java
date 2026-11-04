package com.kisanmandi.service;

public interface EmailService {

    void sendEmailVerification(String toEmail, String recipientName, String verificationLink, String lang);

    void sendPasswordReset(String toEmail, String recipientName, String resetLink, String lang);

    void sendPasswordChanged(String toEmail, String recipientName, String lang);

    void sendOrderPlaced(String toEmail, String customerName, Long orderId, java.math.BigDecimal amount, String link, String lang);

    void sendNewOrderForFarmer(String toEmail, String farmerName, Long orderId, String customerName, java.math.BigDecimal amount, String link, String lang);

    void sendOrderStatusUpdate(String toEmail, String customerName, Long orderId, com.kisanmandi.entity.OrderStatus status, String note, String link, String lang);

    boolean isEmailEnabled();

    // Backward-compatible convenience overloads
    default void sendEmailVerificationEmail(String toEmail, String verificationLink) {
        sendEmailVerification(toEmail, null, verificationLink, "en");
    }

    default void sendPasswordResetEmail(String toEmail, String resetLink) {
        sendPasswordReset(toEmail, null, resetLink, "en");
    }
}
