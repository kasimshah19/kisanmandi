package com.kisanmandi.controller;

import com.kisanmandi.dto.NotificationResponse;
import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.UnreadCountResponse;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Notifications", description = "In-app notifications and alerts")
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthService authService;

    @Operation(summary = "List paginated notifications for the current user")
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Boolean unreadOnly) {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.getMyNotifications(userId, page, size, unreadOnly));
    }

    @Operation(summary = "Get latest notifications for notification bell dropdown")
    @GetMapping("/recent")
    public ResponseEntity<List<NotificationResponse>> getRecentNotifications() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(notificationService.getRecentNotifications(userId));
    }

    @Operation(summary = "Get unread notifications count for navbar badge")
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount() {
        Long userId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(new UnreadCountResponse(notificationService.getUnreadCount(userId)));
    }

    @Operation(summary = "Mark a notification as read (PATCH or PUT)")
    @RequestMapping(value = "/{id}/read", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Long id) {
        Long userId = authService.getCurrentUser().getId();
        notificationService.markAsRead(userId, id);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    @Operation(summary = "Mark all notifications as read for current user (POST or PUT)")
    @RequestMapping(value = "/read-all", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        Long userId = authService.getCurrentUser().getId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @Operation(summary = "Delete a notification")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable Long id) {
        Long userId = authService.getCurrentUser().getId();
        notificationService.deleteNotification(userId, id);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }
}
