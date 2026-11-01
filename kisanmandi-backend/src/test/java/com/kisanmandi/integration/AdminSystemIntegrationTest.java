package com.kisanmandi.integration;

import com.kisanmandi.security.JwtUtil;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminSystemIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private com.kisanmandi.repository.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @org.junit.jupiter.api.BeforeEach
    void setUp() {
        if (!userRepository.existsByEmail("customer@test.com")) {
            userRepository.save(com.kisanmandi.entity.User.builder()
                    .name("Test Customer")
                    .email("customer@test.com")
                    .password(passwordEncoder.encode("Pass123!"))
                    .role(com.kisanmandi.entity.Role.CUSTOMER)
                    .status(com.kisanmandi.entity.UserStatus.ACTIVE)
                    .build());
        }
        if (!userRepository.existsByEmail("admin@test.com")) {
            userRepository.save(com.kisanmandi.entity.User.builder()
                    .name("Test Admin")
                    .email("admin@test.com")
                    .password(passwordEncoder.encode("Pass123!"))
                    .role(com.kisanmandi.entity.Role.ADMIN)
                    .status(com.kisanmandi.entity.UserStatus.ACTIVE)
                    .build());
        }
    }

    @Test
    @DisplayName("GET /api/admin/system requires ADMIN role")
    void testSystemEndpointSecurity() throws Exception {
        // Anonymous -> 401
        mockMvc.perform(get("/api/admin/system"))
                .andExpect(status().isUnauthorized());

        // CUSTOMER -> 403
        String customerToken = "Bearer " + jwtUtil.generateToken("customer@test.com", "CUSTOMER");
        mockMvc.perform(get("/api/admin/system").header("Authorization", customerToken))
                .andExpect(status().isForbidden());

        // ADMIN -> 200 with system telemetry
        String adminToken = "Bearer " + jwtUtil.generateToken("admin@test.com", "ADMIN");
        mockMvc.perform(get("/api/admin/system").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uptimeMs").isNumber())
                .andExpect(jsonPath("$.uptimeFormatted").isString())
                .andExpect(jsonPath("$.appVersion").value("1.0.0"))
                .andExpect(jsonPath("$.activeProfile").value("test"))
                .andExpect(jsonPath("$.databaseStatus").value("CONNECTED"))
                .andExpect(jsonPath("$.jvmMemory.usedMb").isNumber())
                .andExpect(jsonPath("$.lastMandiSync").isMap());
    }
}
