package com.cloudcostdashboard.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "cost_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider; // AWS, AZURE, GCP

    @Column(name = "service_name", nullable = false)
    private String serviceName; // e.g. EC2, RDS, Blob Storage

    @Column(name = "cost_amount", nullable = false)
    private double costAmount;

    @Column(nullable = false)
    private LocalDate date;
}
