package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecommendationDTO {
    private Long id;
    private CloudResourceDTO resource;
    private String actionType;
    private double currentCostPerMonth;
    private double estimatedSavingsPerMonth;
    private String reasoning;
    private boolean isApplied;
}
