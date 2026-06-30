package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceRequest {
    private String provider;
    private String resourceName;
    private String resourceType;
    private String region;
    private double allocatedMemoryGB;
    private double actualUsedMemoryGB;
    private double allocatedCpuPercent;
    private double actualCpuPercent;
    private double costPerDay;
}
