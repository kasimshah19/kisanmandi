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
class ActuatorSecurityTest {

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
    @DisplayName("Public actuator endpoints: /actuator/health and /actuator/info are accessible without authentication")
    void testPublicActuatorEndpoints() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists());

        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/actuator/prometheus requires authentication -> 401 when anonymous")
    void testPrometheusUnauthenticated() throws Exception {
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("/actuator/prometheus requires ROLE_ADMIN -> 403 for CUSTOMER")
    void testPrometheusForbiddenForCustomer() throws Exception {
        String customerToken = "Bearer " + jwtUtil.generateToken("customer@test.com", "CUSTOMER");

        mockMvc.perform(get("/actuator/prometheus").header("Authorization", customerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));
    }

    @Test
    @DisplayName("/actuator/prometheus is accessible -> 200 for ADMIN")
    void testPrometheusAllowedForAdmin() throws Exception {
        String adminToken = "Bearer " + jwtUtil.generateToken("admin@test.com", "ADMIN");

        mockMvc.perform(get("/actuator/prometheus").header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("/actuator/metrics requires authentication -> 401 when anonymous, 200 for ADMIN")
    void testMetricsSecurity() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isUnauthorized());

        String adminToken = "Bearer " + jwtUtil.generateToken("admin@test.com", "ADMIN");
        mockMvc.perform(get("/actuator/metrics").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray());
    }
}
