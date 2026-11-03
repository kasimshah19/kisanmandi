package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.*;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.repository.PasswordResetTokenRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthHardeningIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private com.kisanmandi.repository.EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.kisanmandi.security.RateLimitFilter rateLimitFilter;

    @Autowired
    private com.kisanmandi.repository.RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private com.kisanmandi.repository.LoginAttemptRepository loginAttemptRepository;

    private User testUser;

    @BeforeEach
    void setup() {
        rateLimitFilter.reset();
        refreshTokenRepository.deleteAll();
        loginAttemptRepository.deleteAll();
        emailVerificationTokenRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .name("Hardened User")
                .email("hardened@example.com")
                .password(passwordEncoder.encode("Password@123"))
                .phone("9876543210")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .tokenVersion(1)
                .failedLoginAttempts(0)
                .build();
        testUser = userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        rateLimitFilter.reset();
        refreshTokenRepository.deleteAll();
        loginAttemptRepository.deleteAll();
        emailVerificationTokenRepository.deleteAll();
        passwordResetTokenRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Forgot password does not enumerate users (returns 202 Accepted for both known and unknown emails)")
    void forgotPassword_noEnumeration() throws Exception {
        // Unknown email
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("nonexistent@example.com"))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("If that email is registered, password reset instructions have been sent."));

        // Known email
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ForgotPasswordRequest("hardened@example.com"))))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("If that email is registered, password reset instructions have been sent."));
    }

    @Test
    @DisplayName("Reset password fails with 400 when token is invalid")
    void resetPassword_invalidToken_fails() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest("completely-invalid-token", "NewSecretPass@123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Invalid or expired password reset link"));
    }

    @Test
    @DisplayName("Change password: authenticated user can change password with correct current password")
    void changePassword_success() throws Exception {
        String token = jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getTokenVersion());

        ChangePasswordRequest request = new ChangePasswordRequest("Password@123", "NewPassword@1234");

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        User updated = userRepository.findById(testUser.getId()).orElseThrow();
        assertTrue(passwordEncoder.matches("NewPassword@1234", updated.getPassword()));
        assertEquals(2, updated.getTokenVersion());
    }

    @Test
    @DisplayName("Change password: wrong current password returns 400")
    void changePassword_wrongCurrentPassword_fails() throws Exception {
        String token = jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getTokenVersion());

        ChangePasswordRequest request = new ChangePasswordRequest("WrongPass@123", "NewPassword@1234");

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Current password is incorrect"));
    }

    @Test
    @DisplayName("Logout-all: increments tokenVersion and revokes old JWT")
    void logout_revokesOldJwt() throws Exception {
        String oldToken = jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getTokenVersion());

        // Verify old token works initially
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isOk());

        // Perform logout-all
        mockMvc.perform(post("/api/auth/logout-all")
                        .header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isNoContent());

        // Verify old token is now rejected (tokenVersion mismatch)
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + oldToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Brute force protection: 5 bad attempts locks account and returns 429")
    void bruteForce_fiveAttempts_locksAccount() throws Exception {
        LoginRequest badRequest = new LoginRequest("hardened@example.com", "WrongPassword");

        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badRequest)))
                    .andExpect(status().isUnauthorized());
        }

        // 5th attempt triggers lockout and returns 429
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));

        // 6th attempt returns 429
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("hardened@example.com", "Password@123"))))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Too many failed attempts")));
    }
}
