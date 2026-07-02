package com.cloudcostdashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CostRecordDTO {
    private Long id;
    private String provider;
    private String serviceName;
    private double costAmount;
    private LocalDate date;
}
