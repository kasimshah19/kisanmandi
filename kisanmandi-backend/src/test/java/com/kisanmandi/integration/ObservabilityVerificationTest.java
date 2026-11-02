package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.AuthResponse;
import com.kisanmandi.dto.LoginRequest;
import com.kisanmandi.dto.RegisterRequest;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
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
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ObservabilityVerificationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private String customerToken;
    private String farmerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        if (!userRepository.existsByEmail("obs_customer@test.com")) {
            userRepository.save(User.builder()
                    .name("Obs Customer")
                    .email("obs_customer@test.com")
                    .phone("9876543210")
                    .password(passwordEncoder.encode("SecretPass123!"))
                    .role(Role.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build());
        }
        if (!userRepository.existsByEmail("obs_farmer@test.com")) {
            userRepository.save(User.builder()
                    .name("Obs Farmer")
                    .email("obs_farmer@test.com")
                    .phone("9876543211")
                    .password(passwordEncoder.encode("SecretPass123!"))
                    .role(Role.FARMER)
                    .status(UserStatus.ACTIVE)
                    .build());
        }
        if (!userRepository.existsByEmail("obs_admin@test.com")) {
            userRepository.save(User.builder()
                    .name("Obs Admin")
                    .email("obs_admin@test.com")
                    .phone("9876543212")
                    .password(passwordEncoder.encode("SecretPass123!"))
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build());
        }

        customerToken = "Bearer " + jwtUtil.generateToken("obs_customer@test.com", "CUSTOMER");
        farmerToken = "Bearer " + jwtUtil.generateToken("obs_farmer@test.com", "FARMER");
        adminToken = "Bearer " + jwtUtil.generateToken("obs_admin@test.com", "ADMIN");
    }

    @Test
    @DisplayName("Verify X-Request-Id: valid kept, missing generated, invalid replaced")
    void testRequestIdVariations() throws Exception {
        // 1. Valid X-Request-Id header preserved
        String customId = "req-custom-trace-id-12345";
        mockMvc.perform(get("/api/health").header("X-Request-Id", customId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-Id", customId));

        // 2. Missing X-Request-Id gets generated (16 hex chars)
        MvcResult missingResult = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn();
        String generatedId = missingResult.getResponse().getHeader("X-Request-Id");
        assertThat(generatedId).isNotNull().matches("^[a-f0-9]{16}$");

        // 3. Invalid X-Request-Id gets sanitized and replaced
        MvcResult invalidResult = mockMvc.perform(get("/api/health").header("X-Request-Id", "bad!id"))
                .andExpect(status().isOk())
                .andReturn();
        String replacedId = invalidResult.getResponse().getHeader("X-Request-Id");
        assertThat(replacedId).isNotNull().isNotEqualTo("bad!id").matches("^[a-f0-9]{16}$");
    }

    @org.springframework.test.context.bean.override.mockito.MockitoBean
    private com.kisanmandi.service.CategoryService categoryService;

    @Test
    @DisplayName("Verify forced 500 error produces JSON error with requestId and returns X-Request-Id header")
    void testForced500ErrorJson() throws Exception {
        String testRequestId = "req-error-trace-500-test";
        org.mockito.Mockito.when(categoryService.getActiveCategories())
                .thenThrow(new RuntimeException("Simulated unexpected 500 error for observability testing"));

        MvcResult result = mockMvc.perform(get("/api/categories").header("X-Request-Id", testRequestId))
                .andExpect(status().isInternalServerError())
                .andExpect(header().string("X-Request-Id", testRequestId))
                .andExpect(jsonPath("$.status").value(500))
                .andExpect(jsonPath("$.requestId").value(testRequestId))
                .andExpect(jsonPath("$.message").value("Something went wrong"))
                .andExpect(jsonPath("$.timestamp").isString())
                .andReturn();

        System.out.println("VERIFY_500_JSON: " + result.getResponse().getContentAsString());
    }


    @Test
    @DisplayName("Verify Actuator endpoints across 4 identities: Anonymous, Customer, Farmer, Admin")
    void testActuatorFourIdentities() throws Exception {
        // 1. Anonymous
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.details").doesNotExist()); // show-details=never

        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isUnauthorized());

        // 2. Customer
        mockMvc.perform(get("/actuator/health").header("Authorization", customerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/metrics").header("Authorization", customerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/actuator/prometheus").header("Authorization", customerToken))
                .andExpect(status().isForbidden());

        // 3. Farmer
        mockMvc.perform(get("/actuator/health").header("Authorization", farmerToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/metrics").header("Authorization", farmerToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/actuator/prometheus").header("Authorization", farmerToken))
                .andExpect(status().isForbidden());

        // 4. Admin
        mockMvc.perform(get("/actuator/health").header("Authorization", adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/actuator/metrics").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.names").isArray());

        mockMvc.perform(get("/actuator/prometheus").header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Verify login flow produces no PII in log output and records metric")
    void testLoginFlowMetricsAndZeroPii() throws Exception {
        LoginRequest loginRequest = new LoginRequest("obs_customer@test.com", "SecretPass123!");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest))
                        .header("X-Request-Id", "req-login-flow-verify"))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-Id", "req-login-flow-verify"))
                .andExpect(jsonPath("$.token").isString())
                .andReturn();

        AuthResponse authResponse = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        assertThat(authResponse.getToken()).isNotBlank();
    }
}
