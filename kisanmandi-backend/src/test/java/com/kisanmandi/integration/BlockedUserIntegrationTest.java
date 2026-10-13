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
class BlockedUserIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void blockedUser_existingToken_isRejectedWithUnauthorized() throws Exception {
        User user = User.builder()
                .name("Blocked User")
                .email("blocked@kisanmandi.com")
                .password(passwordEncoder.encode("Pass@12345"))
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        // Token issued while user was active
        String token = "Bearer " + jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        // Now user gets blocked by admin
        user.setStatus(UserStatus.BLOCKED);
        userRepository.save(user);

        // Protected request with the previous token must now be rejected
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", token))
                .andExpect(status().isUnauthorized());
    }
}
