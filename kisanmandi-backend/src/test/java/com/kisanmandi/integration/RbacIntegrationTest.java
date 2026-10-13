package com.kisanmandi.integration;

import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String customerToken;
    private String farmerToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        User customer = User.builder()
                .name("Test Customer")
                .email("customer@test.com")
                .password(passwordEncoder.encode("Pass@12345"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(customer);
        customerToken = "Bearer " + jwtUtil.generateToken(customer.getEmail(), customer.getRole().name());

        User farmer = User.builder()
                .name("Test Farmer")
                .email("farmer@test.com")
                .password(passwordEncoder.encode("Pass@12345"))
                .role(Role.FARMER)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(farmer);
        farmerToken = "Bearer " + jwtUtil.generateToken(farmer.getEmail(), farmer.getRole().name());

        User admin = User.builder()
                .name("Test Admin")
                .email("admin@test.com")
                .password(passwordEncoder.encode("Pass@12345"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        userRepository.save(admin);
        adminToken = "Bearer " + jwtUtil.generateToken(admin.getEmail(), admin.getRole().name());
    }

    @Test
    void unauthenticated_customerEndpoint_returns401() throws Exception {
        mockMvc.perform(get("/api/customer/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticated_farmerEndpoint_returns401() throws Exception {
        mockMvc.perform(get("/api/farmer/orders"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unauthenticated_adminEndpoint_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/farmers"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void customerRole_accessCustomerEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/customer/orders")
                        .header("Authorization", customerToken))
                .andExpect(status().isOk());
    }

    @Test
    void customerRole_accessFarmerEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/api/farmer/orders")
                        .header("Authorization", customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void customerRole_accessAdminEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/farmers")
                        .header("Authorization", customerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void farmerRole_accessFarmerEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/farmer/orders")
                        .header("Authorization", farmerToken))
                .andExpect(status().isOk());
    }

    @Test
    void farmerRole_accessCustomerEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/api/customer/orders")
                        .header("Authorization", farmerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void farmerRole_accessAdminEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/api/admin/farmers")
                        .header("Authorization", farmerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminRole_accessAdminEndpoint_returns200() throws Exception {
        mockMvc.perform(get("/api/admin/farmers")
                        .header("Authorization", adminToken))
                .andExpect(status().isOk());
    }
}
