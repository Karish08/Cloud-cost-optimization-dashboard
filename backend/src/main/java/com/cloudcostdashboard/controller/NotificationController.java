package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.dto.MessageResponse;
import com.cloudcostdashboard.dto.Notification;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.User;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import com.cloudcostdashboard.repository.UserRepository;
import com.cloudcostdashboard.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final CloudResourceRepository resourceRepository;

    public NotificationController(NotificationService notificationService,
                                  UserRepository userRepository,
                                  CloudResourceRepository resourceRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("User not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getNotifications(getCurrentUser()));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        Optional<CloudResource> resourceOpt = resourceRepository.findById(id);
        if (resourceOpt.isPresent()) {
            CloudResource resource = resourceOpt.get();
            if (resource.getUser() == null || !resource.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access denied: resource does not belong to your account"));
            }
        } else {
            return ResponseEntity.notFound().build();
        }

        boolean success = notificationService.markAsRead(id);
        if (success) {
            return ResponseEntity.ok(new MessageResponse("Notification marked as read"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        notificationService.markAllAsRead(getCurrentUser());
        return ResponseEntity.ok(new MessageResponse("All notifications marked as read"));
    }
}
