package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.entity.*;
import com.kisanmandi.repository.NotificationRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private JwtUtil jwtUtil;

    private User user;
    private String jwt;

    @BeforeEach
    void setup() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();

        user = userRepository.save(User.builder()
                .name("Notification Test User")
                .email("notif_" + UUID.randomUUID() + "@example.com")
                .password("$2a$10$hashedpasswordplaceholder")
                .phone("9876543210")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .tokenVersion(1)
                .build());

        jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Create notifications and fetch unread count")
    void testGetUnreadCountAndRecent() throws Exception {
        notificationService.createNotification(user, "Alert 1", "Message 1", "ORDER_PLACED", "101");
        notificationService.createNotification(user, "Alert 2", "Message 2", "ORDER_DELIVERED", "102");

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(2)));

        mockMvc.perform(get("/api/notifications/recent")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].title", is("Alert 2")));
    }

    @Test
    @DisplayName("PUT /api/notifications/{id}/read marks single notification read")
    void testMarkAsRead() throws Exception {
        Notification n = notificationService.createNotification(user, "Alert 1", "Message 1", "INFO", "1");
        assertFalse(n.isRead());

        mockMvc.perform(put("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
        assertTrue(updated.isRead());
    }

    @Test
    @DisplayName("PUT /api/notifications/read-all marks all notifications read")
    void testMarkAllAsRead() throws Exception {
        notificationService.createNotification(user, "Alert 1", "Msg 1", "TYPE", "1");
        notificationService.createNotification(user, "Alert 2", "Msg 2", "TYPE", "2");

        assertEquals(2, notificationRepository.countByUserIdAndReadFalse(user.getId()));

        mockMvc.perform(put("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertEquals(0, notificationRepository.countByUserIdAndReadFalse(user.getId()));
    }
}
