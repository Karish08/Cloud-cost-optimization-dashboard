package com.cloudcostdashboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cloud_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudResource {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider; // AWS, AZURE, GCP

    @Column(name = "resource_id", nullable = false, unique = true)
    private String resourceId;

    @Column(nullable = false)
    private String name;

    @Column(name = "resource_type", nullable = false)
    private String resourceType; // COMPUTE, STORAGE, DATABASE

    @Column(nullable = false)
    private String region;

    @Column(nullable = false)
    private String status; // HEALTHY, IDLE, OVER_PROVISIONED, UNUSED_STORAGE

    @Column(name = "cost_per_day", nullable = false)
    private double costPerDay;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}
