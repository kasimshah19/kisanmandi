package com.kisanmandi.config;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProdConfigValidatorTest {

    @Test
    void validate_validProductionConfig_passes() {
        ProdConfigValidator validator = new ProdConfigValidator();
        ReflectionTestUtils.setField(validator, "dbUrl", "jdbc:mysql://aiven.example.com:12345/defaultdb");
        ReflectionTestUtils.setField(validator, "jwtSecret", "this_is_a_very_long_valid_jwt_secret_at_least_32_chars");

        assertDoesNotThrow(validator::validate);
    }

    @Test
    void validate_missingDbUrl_throwsIllegalStateException() {
        ProdConfigValidator validator = new ProdConfigValidator();
        ReflectionTestUtils.setField(validator, "dbUrl", "");
        ReflectionTestUtils.setField(validator, "jwtSecret", "this_is_a_very_long_valid_jwt_secret_at_least_32_chars");

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("DB_URL is missing"));
    }

    @Test
    void validate_shortJwtSecret_throwsIllegalStateException() {
        ProdConfigValidator validator = new ProdConfigValidator();
        ReflectionTestUtils.setField(validator, "dbUrl", "jdbc:mysql://aiven.example.com:12345/defaultdb");
        ReflectionTestUtils.setField(validator, "jwtSecret", "short_secret");

        IllegalStateException ex = assertThrows(IllegalStateException.class, validator::validate);
        assertTrue(ex.getMessage().contains("JWT_SECRET must be at least 32 characters long"));
    }
}
