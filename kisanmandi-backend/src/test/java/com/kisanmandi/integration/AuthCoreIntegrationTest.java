package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.*;
import com.kisanmandi.entity.RefreshToken;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.repository.LoginAttemptRepository;
import com.kisanmandi.repository.RefreshTokenRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.security.RateLimitFilter;
import com.kisanmandi.security.TokenHashUtil;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthCoreIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private LoginAttemptRepository loginAttemptRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private RateLimitFilter rateLimitFilter;

    private User testUser;

    @BeforeEach
    void setup() {
        rateLimitFilter.reset();
        refreshTokenRepository.deleteAll();
        loginAttemptRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .name("Kisan Ramesh")
                .email("ramesh@kisanmandi.com")
                .password(passwordEncoder.encode("RameshPass@2026"))
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
        refreshTokenRepository.deleteAll();
        loginAttemptRepository.deleteAll();
        userRepository.deleteAll();
        rateLimitFilter.reset();
    }

    @Test
    @DisplayName("Login Lockout: 5 failed attempts lock email for 15 minutes with 429 and Retry-After (no enumeration)")
    void loginLockout_5Attempts_429WithRetryAfter() throws Exception {
        LoginRequest badKnown = new LoginRequest("ramesh@kisanmandi.com", "WrongPassword1");
        LoginRequest badUnknown = new LoginRequest("unknown@kisanmandi.com", "WrongPassword1");

        // 4 failed attempts return 401
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badKnown)))
                    .andExpect(status().isUnauthorized());
        }

        // 5th attempt triggers lockout -> 429
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badKnown)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.retryAfterSeconds").isNumber())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Too many failed attempts")));

        // Same behavior for unknown email (no user enumeration)
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(badUnknown)))
                    .andExpect(status().isUnauthorized());
        }
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badUnknown)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    @DisplayName("Login Success: Issues short-lived access token and httpOnly km_refresh cookie")
    void loginSuccess_issuesTokenAndCookie() throws Exception {
        LoginRequest req = new LoginRequest("ramesh@kisanmandi.com", "RameshPass@2026");

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andReturn();

        String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookie);
        assertTrue(setCookie.contains("km_refresh="));
        assertTrue(setCookie.contains("HttpOnly"));
        assertTrue(setCookie.contains("Path=/api/auth"));
        assertTrue(setCookie.contains("SameSite=Lax"));
    }

    @Test
    @DisplayName("Refresh Token Rotation: Valid cookie rotates token within family")
    void refresh_tokenRotation_success() throws Exception {
        // 1. Login to get initial refresh token
        LoginRequest req = new LoginRequest("ramesh@kisanmandi.com", "RameshPass@2026");
        MvcResult loginRes = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andReturn();

        Cookie refreshCookie = loginRes.getResponse().getCookie("km_refresh");
        assertNotNull(refreshCookie);

        // 2. Refresh call
        MvcResult refreshRes = mockMvc.perform(post("/api/auth/refresh")
                        .header("X-Requested-With", "km-web")
                        .cookie(refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        Cookie newRefreshCookie = refreshRes.getResponse().getCookie("km_refresh");
        assertNotNull(newRefreshCookie);
        assertNotEquals(refreshCookie.getValue(), newRefreshCookie.getValue());
    }

    @Test
    @DisplayName("Refresh: Missing or invalid X-Requested-With header is rejected")
    void refresh_missingHeader_rejected() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(new Cookie("km_refresh", "some-token")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Reuse Detection: Replaying revoked token outside 10s grace window revokes family")
    void refresh_reuseDetection_revokesFamily() throws Exception {
        // Setup initial token and revoke it 15 seconds ago
        String familyId = java.util.UUID.randomUUID().toString();
        String rawToken = "raw-reused-token-test-1234567890123";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .expiresAt(LocalDateTime.now().plusDays(14))
                .revokedAt(LocalDateTime.now().minusSeconds(15)) // Revoked 15 seconds ago
                .build();
        refreshTokenRepository.save(token);

        // Present revoked token -> 401 and family is revoked
        mockMvc.perform(post("/api/auth/refresh")
                        .header("X-Requested-With", "km-web")
                        .cookie(new Cookie("km_refresh", rawToken)))
                .andExpect(status().isUnauthorized());

        var tokensInFamily = refreshTokenRepository.findByFamilyId(familyId);
        assertFalse(tokensInFamily.isEmpty());
        assertTrue(tokensInFamily.stream().allMatch(RefreshToken::isRevoked));
    }

    @Test
    @DisplayName("Grace Window: Replaying revoked token within 10s grace window returns valid token")
    void refresh_graceWindow_returnsValidToken() throws Exception {
        String familyId = java.util.UUID.randomUUID().toString();
        String rawToken = "raw-grace-token-test-12345678901234";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .createdAt(LocalDateTime.now().minusSeconds(20))
                .expiresAt(LocalDateTime.now().plusDays(14))
                .revokedAt(LocalDateTime.now().minusSeconds(3)) // Revoked 3 seconds ago (within grace window)
                .build();
        refreshTokenRepository.save(token);

        mockMvc.perform(post("/api/auth/refresh")
                        .header("X-Requested-With", "km-web")
                        .cookie(new Cookie("km_refresh", rawToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    @DisplayName("Logout: Revokes family and clears cookie with 204")
    void logout_revokesFamilyAndClearsCookie() throws Exception {
        String familyId = java.util.UUID.randomUUID().toString();
        String rawToken = "raw-logout-token-1234567890123456";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(14))
                .build();
        refreshTokenRepository.save(token);

        MvcResult res = mockMvc.perform(post("/api/auth/logout")
                        .cookie(new Cookie("km_refresh", rawToken)))
                .andExpect(status().isNoContent())
                .andReturn();

        String setCookie = res.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookie);
        assertTrue(setCookie.contains("Max-Age=0"));

        RefreshToken updated = refreshTokenRepository.findByTokenHash(tokenHash).orElseThrow();
        assertTrue(updated.isRevoked());
    }

    @Test
    @DisplayName("Change Password: Bumps tokenVersion and immediately invalidates previous access token")
    void changePassword_bumpsTokenVersion_invalidatesOldToken() throws Exception {
        // Generate valid token for version 1
        String oldAccessToken = jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), 1);

        ChangePasswordRequest changeReq = new ChangePasswordRequest("RameshPass@2026", "BrandNewSecurePass99#");

        mockMvc.perform(put("/api/auth/password")
                        .header("Authorization", "Bearer " + oldAccessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(changeReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());

        // Previous token has tokenVersion 1, but user now has tokenVersion 2 -> 401 on protected endpoint
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + oldAccessToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Logout All: Bumps tokenVersion and invalidates sessions across all devices")
    void logoutAll_bumpsTokenVersion() throws Exception {
        String accessToken = jwtUtil.generateToken(testUser.getEmail(), testUser.getRole().name(), testUser.getTokenVersion());

        mockMvc.perform(post("/api/auth/logout-all")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        // Old access token should now be rejected
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Blocked User: Cannot refresh token")
    void blockedUser_cannotRefresh() throws Exception {
        testUser.setStatus(UserStatus.BLOCKED);
        userRepository.save(testUser);

        String rawToken = "raw-blocked-token-1234567890123";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        RefreshToken token = RefreshToken.builder()
                .user(testUser)
                .tokenHash(tokenHash)
                .familyId(java.util.UUID.randomUUID().toString())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(14))
                .build();
        refreshTokenRepository.save(token);

        mockMvc.perform(post("/api/auth/refresh")
                        .header("X-Requested-With", "km-web")
                        .cookie(new Cookie("km_refresh", rawToken)))
                .andExpect(status().isUnauthorized());
    }
}
