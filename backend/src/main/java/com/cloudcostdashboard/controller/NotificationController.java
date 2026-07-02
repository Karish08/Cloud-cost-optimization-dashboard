package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.dto.Notification;
import com.cloudcostdashboard.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id);
        if (success) {
            return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
