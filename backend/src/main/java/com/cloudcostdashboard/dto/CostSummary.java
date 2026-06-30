package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CostSummary {
    private double totalSpent30Days;
    private double monthlyRunRate;
    private double potentialSavings;
}
