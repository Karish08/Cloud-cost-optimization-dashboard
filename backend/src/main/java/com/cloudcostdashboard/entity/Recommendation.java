package com.cloudcostdashboard.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recommendations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "db_resource_id", nullable = false)
    private CloudResource resource;

    @Column(name = "action_type", nullable = false)
    private String actionType; // RESIZE, SHUTDOWN, CHEAPER_TIER

    @Column(name = "current_cost_per_month", nullable = false)
    private double currentCostPerMonth;

    @Column(name = "estimated_savings_per_month", nullable = false)
    private double estimatedSavingsPerMonth;

    @Column(columnDefinition = "TEXT")
    private String reasoning;

    @Column(name = "is_applied", nullable = false)
    private boolean isApplied;
}
