package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.AuthResponse;
import com.kisanmandi.dto.LoginRequest;
import com.kisanmandi.dto.RegisterRequest;
import com.kisanmandi.entity.Role;
import com.kisanmandi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void fullAuthFlow_registerLoginMe_succeeds() throws Exception {
        // 1. Register
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setName("Kasim Shah");
        registerReq.setEmail("flow@kisanmandi.com");
        registerReq.setPassword("Password@123");
        registerReq.setPhone("9876543210");
        registerReq.setRole(Role.CUSTOMER);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Registration successful! Please login."));

        // 2. Login
        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("flow@kisanmandi.com");
        loginReq.setPassword("Password@123");

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        AuthResponse authResp = objectMapper.readValue(loginResult.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(authResp.getToken());
        assertEquals("CUSTOMER", authResp.getRole());

        // 3. /api/auth/me
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + authResp.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("flow@kisanmandi.com"))
                .andExpect(jsonPath("$.name").value("Kasim Shah"))
                .andExpect(jsonPath("$.role").value("CUSTOMER"));
    }

    @Test
    void register_validationErrors_returns400WithFieldDetails() throws Exception {
        RegisterRequest invalidReq = new RegisterRequest();
        invalidReq.setName("");
        invalidReq.setEmail("not-an-email");
        invalidReq.setPassword("123"); // Too short
        invalidReq.setRole(null);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors").exists());
    }
}
