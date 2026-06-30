package com.cloudcostdashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usage_metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageMetric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "db_resource_id", nullable = false)
    private CloudResource resource;

    @Column(name = "cpu_utilization", nullable = false)
    private double cpuUtilization;

    @Column(name = "memory_utilization", nullable = false)
    private double memoryUtilization;

    @Column(name = "storage_used_gb", nullable = false)
    private double storageUsedGB;

    @Column(name = "network_usage_gb", nullable = false)
    private double networkUsageGB;

    @Column(name = "storage_read_write_ops", nullable = false)
    private double storageReadWriteOps;

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
