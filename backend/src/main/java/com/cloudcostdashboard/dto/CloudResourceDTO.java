package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloudResourceDTO {
    private Long id;
    private String provider;
    private String resourceId;
    private String name;
    private String resourceType;
    private String region;
    private String status;
    private double costPerDay;
}
