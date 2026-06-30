package com.cloudcostdashboard.dto;

import com.cloudcostdashboard.entity.CloudResource;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResourceAnalysisResponse {
    private CloudResource resource;
    private String status;
    private double estimatedSavings;
    private String recommendationAction;
    private String reasoning;
}
