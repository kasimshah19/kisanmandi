package com.kisanmandi.security;

import java.util.*;

public final class PasswordPolicy {

    public static final String CODE_TOO_SHORT = "PASSWORD_TOO_SHORT";
    public static final String CODE_NEEDS_LETTER = "PASSWORD_NEEDS_LETTER";
    public static final String CODE_NEEDS_DIGIT = "PASSWORD_NEEDS_DIGIT";
    public static final String CODE_TOO_COMMON = "PASSWORD_TOO_COMMON";
    public static final String CODE_CONTAINS_EMAIL = "PASSWORD_CONTAINS_EMAIL";

    public static final int MIN_LENGTH = 8;
    public static final int MAX_LENGTH = 72; // BCrypt limit

    private static final Set<String> COMMON_PASSWORDS = Set.of(
            "12345678", "123456789", "1234567890", "password", "password1", "password12", "password123",
            "password1234", "qwerty123", "qwertyuiop", "letmein123", "welcome1", "welcome12", "welcome123",
            "admin123", "admin1234", "iloveyou1", "sunshine1", "princess1", "football1", "monkey123",
            "shadow123", "dragon123", "master123", "freedom123", "trustno1", "computer1", "superman1",
            "charlie1", "secret123", "killer123", "starwars1", "system123", "server123", "root1234",
            "pass1234", "india123", "kisan123", "mandi123", "farmer123", "customer1", "passcode1",
            "changeme1", "default123", "testing123", "tester123", "sample123", "temp1234", "user1234",
            "guest123", "welcome01", "password01", "p@ssword1", "p@ssw0rd1", "hunter21", "baseball1",
            "soccer123", "hockey123", "basketball1", "cheese123", "orange123", "purple123", "yellow123",
            "coffee123", "pepper123", "ginger123", "buster123", "harley123", "bailey123", "magical1",
            "cookie123", "button123", "peanut123", "tiger123", "cowboy123", "freedom1", "hannah123",
            "summer123", "winter123", "spring123", "autumn123", "london123", "matrix123", "diamond1",
            "silver123", "golden123", "jordan123", "jackson1", "michael1", "thomas123", "robert123",
            "william1", "daniel123", "matthew1", "anthony1", "donald123", "stephen1", "andrew123",
            "kisanmandi1", "kisanmandi123"
    );

    private PasswordPolicy() {}

    /**
     * Validates a password against policy rules.
     *
     * @param password the password to validate
     * @param email optional user email (can be null)
     * @return list of failing error codes, or empty list if valid
     */
    public static List<String> validate(String password, String email) {
        List<String> errors = new ArrayList<>();
        if (password == null || password.length() < MIN_LENGTH || password.length() > MAX_LENGTH) {
            errors.add(CODE_TOO_SHORT);
        }

        if (password != null) {
            boolean hasLetter = false;
            boolean hasDigit = false;
            for (char c : password.toCharArray()) {
                if (Character.isLetter(c)) hasLetter = true;
                if (Character.isDigit(c)) hasDigit = true;
            }

            if (!hasLetter) {
                errors.add(CODE_NEEDS_LETTER);
            }
            if (!hasDigit) {
                errors.add(CODE_NEEDS_DIGIT);
            }

            String normalized = password.toLowerCase(Locale.ROOT).trim();
            if (COMMON_PASSWORDS.contains(normalized)) {
                errors.add(CODE_TOO_COMMON);
            }

            if (email != null && email.contains("@")) {
                String localPart = email.substring(0, email.indexOf('@')).toLowerCase(Locale.ROOT).trim();
                if (localPart.length() >= 3 && normalized.contains(localPart)) {
                    errors.add(CODE_CONTAINS_EMAIL);
                } else if (localPart.length() >= 3) {
                    // Check segments separated by ., _, +, -
                    String[] parts = localPart.split("[._+\\-]+");
                    for (String part : parts) {
                        if (part.length() >= 3 && normalized.contains(part)) {
                            errors.add(CODE_CONTAINS_EMAIL);
                            break;
                        }
                    }
                }
            }
        }

        return errors;
    }

    public static String getFirstErrorCode(String password, String email) {
        List<String> errors = validate(password, email);
        return errors.isEmpty() ? null : errors.get(0);
    }
}

