package com.cloudcostdashboard.service;

import com.cloudcostdashboard.dto.Notification;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    private final CloudResourceRepository resourceRepository;
    
    // In-memory store for isRead status and createdAt timestamp
    // Key: Resource ID (Long), Value: NotificationState
    private final Map<Long, NotificationState> stateMap = new ConcurrentHashMap<>();

    public NotificationService(CloudResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public static class NotificationState {
        private final LocalDateTime createdAt;
        private boolean isRead;

        public NotificationState(LocalDateTime createdAt, boolean isRead) {
            this.createdAt = createdAt;
            this.isRead = isRead;
        }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public boolean isRead() { return isRead; }
        public void setRead(boolean read) { isRead = read; }
    }

    public List<Notification> getNotifications() {
        List<CloudResource> resources = resourceRepository.findAll();
        List<Notification> notifications = new ArrayList<>();
        Set<Long> activeUnhealthyIds = new HashSet<>();

        for (CloudResource resource : resources) {
            String status = resource.getStatus();
            if (status == null || "HEALTHY".equalsIgnoreCase(status)) {
                continue;
            }

            Long id = resource.getId();
            activeUnhealthyIds.add(id);

            // Compute/retrieve state
            NotificationState state = stateMap.computeIfAbsent(id, k -> new NotificationState(LocalDateTime.now(), false));

            // Generate notification fields based on status
            String type;
            String message;
            double estimatedSavings;
            double monthlyCost = resource.getCostPerDay() * 30;

            if ("IDLE".equalsIgnoreCase(status)) {
                estimatedSavings = monthlyCost;
                if (monthlyCost > 200) {
                    type = "CRITICAL";
                } else {
                    type = "WARNING";
                }
                message = String.format("WARNING: %s on %s has been idle for 7+ days. Estimated waste: $%.2f/month.", 
                        resource.getName(), resource.getProvider(), monthlyCost);
            } else if ("OVER_PROVISIONED".equalsIgnoreCase(status)) {
                estimatedSavings = monthlyCost * 0.5;
                type = "INFO";
                message = String.format("INFO: %s on %s is over-provisioned. You could save $%.2f/month by resizing.", 
                        resource.getName(), resource.getProvider(), estimatedSavings);
            } else if ("UNUSED_STORAGE".equalsIgnoreCase(status)) {
                estimatedSavings = monthlyCost * 0.7;
                type = "WARNING";
                message = String.format("WARNING: %s storage bucket on %s has had no activity for 30 days. Estimated waste: $%.2f/month.", 
                        resource.getName(), resource.getProvider(), monthlyCost);
            } else {
                continue; // Skip unrecognized statuses
            }

            notifications.add(Notification.builder()
                    .id(id)
                    .type(type)
                    .message(message)
                    .resourceId(resource.getResourceId())
                    .provider(resource.getProvider())
                    .estimatedSavings(estimatedSavings)
                    .createdAt(state.getCreatedAt())
                    .isRead(state.isRead())
                    .build());
        }

        // Clean up stateMap for resources that are no longer unhealthy/present
        stateMap.keySet().removeIf(id -> !activeUnhealthyIds.contains(id));

        // Sort notifications: CRITICAL first, then by createdAt descending
        notifications.sort((n1, n2) -> {
            boolean isCrit1 = "CRITICAL".equals(n1.getType());
            boolean isCrit2 = "CRITICAL".equals(n2.getType());
            if (isCrit1 && !isCrit2) return -1;
            if (!isCrit1 && isCrit2) return 1;
            return n2.getCreatedAt().compareTo(n1.getCreatedAt());
        });

        return notifications;
    }

    public boolean markAsRead(Long id) {
        NotificationState state = stateMap.get(id);
        if (state != null) {
            state.setRead(true);
            return true;
        }
        return false;
    }

    public void markAllAsRead() {
        for (NotificationState state : stateMap.values()) {
            state.setRead(true);
        }
    }
}
