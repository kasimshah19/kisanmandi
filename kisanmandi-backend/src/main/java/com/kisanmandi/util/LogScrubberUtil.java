package com.kisanmandi.util;

public final class LogScrubberUtil {

    private LogScrubberUtil() {
        // Utility class
    }

    /**
     * Masks an email address to protect PII (e.g., kasim@example.com -> k***@example.com).
     */
    public static String maskEmail(String email) {
        if (email == null || email.isBlank()) {
            return "unknown";
        }
        String trimmed = email.trim();
        int atIndex = trimmed.indexOf('@');
        if (atIndex <= 0 || atIndex == trimmed.length() - 1) {
            return "***";
        }
        String local = trimmed.substring(0, atIndex);
        String domain = trimmed.substring(atIndex + 1);
        char firstChar = local.charAt(0);
        return firstChar + "***@" + domain;
    }

    /**
     * Masks a phone number to protect PII (e.g., 9876543210 -> ******3210).
     */
    public static String maskPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            return "unknown";
        }
        String digits = phone.replaceAll("\\s+", "");
        if (digits.length() <= 4) {
            return "****";
        }
        String lastFour = digits.substring(digits.length() - 4);
        return "*".repeat(digits.length() - 4) + lastFour;
    }

    /**
     * Removes query strings and fragment identifiers from URLs to prevent credential leakage.
     */
    public static String scrubUrl(String url) {
        if (url == null || url.isBlank()) {
            return "";
        }
        int queryIdx = url.indexOf('?');
        int hashIdx = url.indexOf('#');
        int cutIdx = -1;
        if (queryIdx != -1 && hashIdx != -1) {
            cutIdx = Math.min(queryIdx, hashIdx);
        } else if (queryIdx != -1) {
            cutIdx = queryIdx;
        } else if (hashIdx != -1) {
            cutIdx = hashIdx;
        }

        return cutIdx != -1 ? url.substring(0, cutIdx) : url;
    }
}

