package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    private Long id;
    private String type; // WARNING, INFO, CRITICAL
    private String message;
    private String resourceId;
    private String provider;
    private double estimatedSavings;
    private LocalDateTime createdAt;
    private boolean isRead;
}
