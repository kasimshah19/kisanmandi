package com.kisanmandi.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class PasswordPolicyTest {

    @Test
    @DisplayName("Short password returns PASSWORD_TOO_SHORT")
    void validate_tooShort() {
        List<String> errors = PasswordPolicy.validate("Short1", "user@example.com");
        assertTrue(errors.contains(PasswordPolicy.CODE_TOO_SHORT));
    }

    @Test
    @DisplayName("Password without letters returns PASSWORD_NEEDS_LETTER")
    void validate_needsLetter() {
        List<String> errors = PasswordPolicy.validate("1234567890", "user@example.com");
        assertTrue(errors.contains(PasswordPolicy.CODE_NEEDS_LETTER));
    }

    @Test
    @DisplayName("Password without digits returns PASSWORD_NEEDS_DIGIT")
    void validate_needsDigit() {
        List<String> errors = PasswordPolicy.validate("AllLettersPassword", "user@example.com");
        assertTrue(errors.contains(PasswordPolicy.CODE_NEEDS_DIGIT));
    }

    @Test
    @DisplayName("Password in common blocklist returns PASSWORD_TOO_COMMON")
    void validate_tooCommon() {
        List<String> errors = PasswordPolicy.validate("password123", "user@example.com");
        assertTrue(errors.contains(PasswordPolicy.CODE_TOO_COMMON));
    }

    @Test
    @DisplayName("Password containing email username returns PASSWORD_CONTAINS_EMAIL")
    void validate_containsEmailLocalPart() {
        List<String> errors = PasswordPolicy.validate("MyRameshKumar123#", "ramesh.kumar@example.com");
        assertTrue(errors.contains(PasswordPolicy.CODE_CONTAINS_EMAIL));
    }

    @Test
    @DisplayName("Strong compliant password returns no errors")
    void validate_compliantPassword() {
        List<String> errors = PasswordPolicy.validate("KisanMandi2026Secure!", "user@example.com");
        assertTrue(errors.isEmpty());
    }
}
