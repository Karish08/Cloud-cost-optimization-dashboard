package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostForecastDTO {
    private String date;
    private Double actualSpend;
    private Double forecastSpend;
}
