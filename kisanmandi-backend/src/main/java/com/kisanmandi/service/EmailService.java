package com.kisanmandi.service;

public interface EmailService {

    void sendEmailVerification(String toEmail, String recipientName, String verificationLink, String lang);

    void sendPasswordReset(String toEmail, String recipientName, String resetLink, String lang);

    void sendPasswordChanged(String toEmail, String recipientName, String lang);

    boolean isEmailEnabled();

    // Backward-compatible convenience overloads
    default void sendEmailVerificationEmail(String toEmail, String verificationLink) {
        sendEmailVerification(toEmail, null, verificationLink, "en");
    }

    default void sendPasswordResetEmail(String toEmail, String resetLink) {
        sendPasswordReset(toEmail, null, resetLink, "en");
    }
}
