package com.kisanmandi.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String VALID_SECRET = "super_secret_jwt_key_at_least_32_characters_long!";

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", VALID_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationMs", 3600000L); // 1 hour
        jwtUtil.init();
    }

    @Test
    @DisplayName("Generate and Validate: Token valid and extracts email correctly")
    void generateAndValidate_success() {
        String token = jwtUtil.generateToken("kisan@example.com", "FARMER");
        assertNotNull(token);

        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("kisan@example.com", jwtUtil.extractEmail(token));
    }

    @Test
    @DisplayName("Validate: Expired token returns false")
    void validateToken_expiredToken_returnsFalse() {
        JwtUtil shortLivedJwt = new JwtUtil();
        ReflectionTestUtils.setField(shortLivedJwt, "secret", VALID_SECRET);
        ReflectionTestUtils.setField(shortLivedJwt, "expirationMs", -1000L); // Expired 1 second ago
        shortLivedJwt.init();

        String expiredToken = shortLivedJwt.generateToken("kisan@example.com", "FARMER");
        assertFalse(jwtUtil.isTokenValid(expiredToken));
    }

    @Test
    @DisplayName("Validate: Tampered token returns false")
    void validateToken_tamperedToken_returnsFalse() {
        String token = jwtUtil.generateToken("kisan@example.com", "FARMER");
        String tamperedToken = token + "xyz";

        assertFalse(jwtUtil.isTokenValid(tamperedToken));
    }

    @Test
    @DisplayName("Startup: Secret shorter than 32 chars throws IllegalStateException")
    void init_shortSecret_throwsException() {
        JwtUtil invalidJwt = new JwtUtil();
        ReflectionTestUtils.setField(invalidJwt, "secret", "too_short");
        ReflectionTestUtils.setField(invalidJwt, "expirationMs", 3600000L);

        IllegalStateException ex = assertThrows(IllegalStateException.class, invalidJwt::init);
        assertTrue(ex.getMessage().contains("at least 32 characters"));
    }
}
