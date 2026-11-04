package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.entity.*;
import com.kisanmandi.event.*;
import com.kisanmandi.repository.NotificationRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.service.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
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
    private ApplicationEventPublisher eventPublisher;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private User user;
    private User otherUser;
    private String jwt;
    private String otherJwt;

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

        otherUser = userRepository.save(User.builder()
                .name("Other User")
                .email("other_" + UUID.randomUUID() + "@example.com")
                .password("$2a$10$hashedpasswordplaceholder")
                .phone("9876543211")
                .role(Role.FARMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .tokenVersion(1)
                .build());

        jwt = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
        otherJwt = jwtUtil.generateToken(otherUser.getEmail(), otherUser.getRole().name(), otherUser.getTokenVersion());
    }

    @AfterEach
    void tearDown() {
        notificationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Create notifications and fetch unread count & recent list")
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
                .andExpect(jsonPath("$[0].fallbackText").exists());
    }

    @Test
    @DisplayName("PUT and PATCH /api/notifications/{id}/read marks single notification read")
    void testMarkAsRead() throws Exception {
        Notification n = notificationService.createNotification(user, "Alert 1", "Message 1", "INFO", "1");
        assertFalse(n.isRead());

        mockMvc.perform(patch("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        Notification updated = notificationRepository.findById(n.getId()).orElseThrow();
        assertTrue(updated.isRead());
        assertNotNull(updated.getReadAt());
    }

    @Test
    @DisplayName("POST and PUT /api/notifications/read-all marks all notifications read")
    void testMarkAllAsRead() throws Exception {
        notificationService.createNotification(user, "Alert 1", "Msg 1", "TYPE", "1");
        notificationService.createNotification(user, "Alert 2", "Msg 2", "TYPE", "2");

        assertEquals(2, notificationRepository.countByUserIdAndReadAtIsNull(user.getId()));

        mockMvc.perform(post("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertEquals(0, notificationRepository.countByUserIdAndReadAtIsNull(user.getId()));
    }

    @Test
    @DisplayName("IDOR prevention: cannot mark as read or delete another user's notification")
    void testIdorPrevention() throws Exception {
        Notification n = notificationService.createNotification(user, "Secret", "Notice", "SECURITY", null);

        // Attempt by otherUser -> 404
        mockMvc.perform(patch("/api/notifications/" + n.getId() + "/read")
                        .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/notifications/" + n.getId())
                        .header("Authorization", "Bearer " + otherJwt))
                .andExpect(status().isNotFound());

        // Still unread and exists
        Notification untouched = notificationRepository.findById(n.getId()).orElseThrow();
        assertFalse(untouched.isRead());

        // Owner can delete
        mockMvc.perform(delete("/api/notifications/" + n.getId())
                        .header("Authorization", "Bearer " + jwt))
                .andExpect(status().isOk());

        assertTrue(notificationRepository.findById(n.getId()).isEmpty());
    }

    @Test
    @DisplayName("Domain Events publish and create in-app notifications in same transaction")
    void testDomainEventsCreateNotifications() {
        // 1. OrderPlacedEvent -> Farmer receives notification
        Order fakeOrder = Order.builder()
                .id(501L)
                .farmer(otherUser)
                .customer(user)
                .totalAmount(BigDecimal.valueOf(1250))
                .status(OrderStatus.PLACED)
                .items(Collections.emptyList())
                .build();

        eventPublisher.publishEvent(new OrderPlacedEvent(fakeOrder));

        List<Notification> farmerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(otherUser.getId());
        assertFalse(farmerNotifs.isEmpty());
        Notification orderPlacedNotif = farmerNotifs.get(0);
        assertEquals("ORDER_PLACED", orderPlacedNotif.getType());
        assertEquals("notifications.order_placed.title", orderPlacedNotif.getTitleKey());
        assertEquals("/farmer/orders", orderPlacedNotif.getLink());

        // 2. OrderStatusChangedEvent (ACCEPTED) -> Customer receives notification
        eventPublisher.publishEvent(new OrderStatusChangedEvent(
                fakeOrder.getId(), fakeOrder, OrderStatus.PLACED, OrderStatus.ACCEPTED, "FARMER", "Accepted by farmer"
        ));

        List<Notification> customerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        assertFalse(customerNotifs.isEmpty());
        Notification acceptedNotif = customerNotifs.get(0);
        assertEquals("ORDER_ACCEPTED", acceptedNotif.getType());
        assertEquals("notifications.order_accepted.title", acceptedNotif.getTitleKey());
        assertEquals("/customer/orders/501", acceptedNotif.getLink());

        // 3. ReviewCreatedEvent -> Farmer receives notification
        eventPublisher.publishEvent(new ReviewCreatedEvent(
                10L, fakeOrder.getId(), otherUser.getId(), user.getId(), user.getName(), 5, "Great mangoes!", null
        ));

        farmerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(otherUser.getId());
        Notification reviewNotif = farmerNotifs.stream()
                .filter(n -> "REVIEW_CREATED".equals(n.getType()))
                .findFirst().orElseThrow();
        assertEquals("notifications.review_created.title", reviewNotif.getTitleKey());
        assertEquals("/farmer/reviews", reviewNotif.getLink());

        // 4. LowStockDetectedEvent -> Farmer receives notification
        eventPublisher.publishEvent(new LowStockDetectedEvent(
                88L, otherUser.getId(), "Alphonso Mango", BigDecimal.valueOf(3)
        ));

        farmerNotifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(otherUser.getId());
        Notification lowStockNotif = farmerNotifs.stream()
                .filter(n -> "LOW_STOCK".equals(n.getType()))
                .findFirst().orElseThrow();
        assertEquals("notifications.low_stock.title", lowStockNotif.getTitleKey());
        assertEquals("/farmer/products", lowStockNotif.getLink());
    }

    @Test
    @DisplayName("Retention cleanup purges read >30d and any >90d")
    void testRetentionCleanup() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Fresh notification: keep
        Notification fresh = Notification.builder()
                .user(user)
                .type("TEST")
                .titleKey("notifications.test.title")
                .bodyKey("notifications.test.body")
                .fallbackText("Fresh")
                .createdAt(now.minusDays(2))
                .build();
        notificationRepository.save(fresh);

        // 2. Read notification older than 30 days: delete
        Notification oldRead = Notification.builder()
                .user(user)
                .type("TEST")
                .titleKey("notifications.test.title")
                .bodyKey("notifications.test.body")
                .fallbackText("Old read")
                .build();
        oldRead = notificationRepository.save(oldRead);
        jdbcTemplate.update("UPDATE notifications SET created_at = ?, read_at = ? WHERE id = ?",
                now.minusDays(40), now.minusDays(35), oldRead.getId());

        // 3. Unread notification older than 90 days: delete
        Notification veryOldUnread = Notification.builder()
                .user(user)
                .type("TEST")
                .titleKey("notifications.test.title")
                .bodyKey("notifications.test.body")
                .fallbackText("Very old unread")
                .build();
        veryOldUnread = notificationRepository.save(veryOldUnread);
        jdbcTemplate.update("UPDATE notifications SET created_at = ? WHERE id = ?",
                now.minusDays(95), veryOldUnread.getId());

        assertEquals(3, notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).size());

        // Run cleanup
        notificationService.cleanupOldNotifications();

        List<Notification> remaining = notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        assertEquals(1, remaining.size());
        assertEquals(fresh.getId(), remaining.get(0).getId());
    }
}
