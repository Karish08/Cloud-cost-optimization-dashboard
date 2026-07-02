package com.cloudcostdashboard.service;

import com.cloudcostdashboard.dto.CostForecastDTO;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.CostRecord;
import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.entity.UsageMetric;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import com.cloudcostdashboard.repository.CostRecordRepository;
import com.cloudcostdashboard.repository.RecommendationRepository;
import com.cloudcostdashboard.repository.UsageMetricRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RecommendationEngineService {

    private final CloudResourceRepository resourceRepository;
    private final UsageMetricRepository metricRepository;
    private final RecommendationRepository recommendationRepository;
    private final CostRecordRepository costRecordRepository;

    public RecommendationEngineService(CloudResourceRepository resourceRepository,
                                       UsageMetricRepository metricRepository,
                                       RecommendationRepository recommendationRepository,
                                       CostRecordRepository costRecordRepository) {
        this.resourceRepository = resourceRepository;
        this.metricRepository = metricRepository;
        this.recommendationRepository = recommendationRepository;
        this.costRecordRepository = costRecordRepository;
    }

    @Transactional
    public void runAnalysis() {
        log.info("Starting cloud cost optimization analysis...");
        List<CloudResource> resources = resourceRepository.findAll();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime sevenDaysAgo = now.minusDays(7);
        LocalDateTime thirtyDaysAgo = now.minusDays(30);

        for (CloudResource resource : resources) {
            // Skip analysis if the resource is healthy or recommendation is already applied
            List<Recommendation> existing = recommendationRepository.findByResource(resource);
            boolean alreadyApplied = existing.stream().anyMatch(Recommendation::isApplied);
            if (alreadyApplied) {
                continue;
            }

            List<UsageMetric> last7DaysMetrics = metricRepository
                    .findByResourceAndTimestampAfterOrderByTimestampAsc(resource, sevenDaysAgo);
            List<UsageMetric> last30DaysMetrics = metricRepository
                    .findByResourceAndTimestampAfterOrderByTimestampAsc(resource, thirtyDaysAgo);

            if (last7DaysMetrics.isEmpty()) {
                continue;
            }

            // Calculate averages
            double avgCpu = last7DaysMetrics.stream().mapToDouble(UsageMetric::getCpuUtilization).average().orElse(0.0);
            double avgMem = last7DaysMetrics.stream().mapToDouble(UsageMetric::getMemoryUtilization).average().orElse(0.0);
            double totalOpsLast30 = last30DaysMetrics.stream().mapToDouble(UsageMetric::getStorageReadWriteOps).sum();

            // 1. Idle rule: CPU < 5% over 7 days
            if ("COMPUTE".equals(resource.getResourceType()) && avgCpu < 5.0) {
                createOrUpdateRecommendation(resource, "SHUTDOWN", 
                        resource.getCostPerDay() * 30, 
                        resource.getCostPerDay() * 30,
                        String.format("Resource CPU utilization averaged %.2f%% over the last 7 days, which is below the idle threshold of 5%%. Shutting down this instance will eliminate waste.", avgCpu));
                resource.setStatus("IDLE");
                resourceRepository.save(resource);
            }
            // 2. Over-provisioned rule: CPU/memory < 20% over 7 days
            else if (("COMPUTE".equals(resource.getResourceType()) || "DATABASE".equals(resource.getResourceType())) 
                    && avgCpu < 20.0 && avgMem < 20.0) {
                double savings = resource.getCostPerDay() * 30 * 0.5; // Resizing saves 50%
                createOrUpdateRecommendation(resource, "RESIZE", 
                        resource.getCostPerDay() * 30, 
                        savings,
                        String.format("Resource average CPU (%.2f%%) and Memory (%.2f%%) are below the 20%% threshold over the last 7 days. Downsizing to a smaller instance type is recommended.", avgCpu, avgMem));
                resource.setStatus("OVER_PROVISIONED");
                resourceRepository.save(resource);
            }
            // 3. Unused storage rule: no read/write ops in 30 days
            else if ("STORAGE".equals(resource.getResourceType()) && totalOpsLast30 == 0 && !last30DaysMetrics.isEmpty()) {
                createOrUpdateRecommendation(resource, "CHEAPER_TIER", 
                        resource.getCostPerDay() * 30, 
                        resource.getCostPerDay() * 30 * 0.7, // 70% savings by archiving
                        "No read/write activity was recorded on this storage volume in the past 30 days. Archiving to cold storage or deleting this volume is recommended.");
                resource.setStatus("UNUSED_STORAGE");
                resourceRepository.save(resource);
            } else {
                // If it was marked idle or over-provisioned previously but metrics are now healthy
                if (!"HEALTHY".equals(resource.getStatus())) {
                    resource.setStatus("HEALTHY");
                    resourceRepository.save(resource);
                }
            }
        }
        log.info("Analysis complete.");
    }

    private void createOrUpdateRecommendation(CloudResource resource, String actionType, 
                                             double currentCost, double savings, String reasoning) {
        List<Recommendation> existingList = recommendationRepository.findByResource(resource);
        Recommendation recommendation;
        if (!existingList.isEmpty()) {
            recommendation = existingList.get(0);
        } else {
            recommendation = new Recommendation();
            recommendation.setResource(resource);
            recommendation.setApplied(false);
        }
        recommendation.setActionType(actionType);
        recommendation.setCurrentCostPerMonth(currentCost);
        recommendation.setEstimatedSavingsPerMonth(savings);
        recommendation.setReasoning(reasoning);
        recommendationRepository.save(recommendation);
    }

    @Transactional
    public void applyRecommendation(Long recommendationId) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + recommendationId));
        
        if (rec.isApplied()) {
            return;
        }

        rec.setApplied(true);
        recommendationRepository.save(rec);

        CloudResource res = rec.getResource();
        res.setStatus("HEALTHY");
        
        // Adjust cost based on action
        if ("SHUTDOWN".equals(rec.getActionType())) {
            res.setCostPerDay(0.0);
        } else if ("RESIZE".equals(rec.getActionType())) {
            res.setCostPerDay(res.getCostPerDay() * 0.5);
        } else if ("CHEAPER_TIER".equals(rec.getActionType())) {
            res.setCostPerDay(res.getCostPerDay() * 0.3);
        }
        resourceRepository.save(res);
        log.info("Applied recommendation ID: {} for resource: {}", recommendationId, res.getResourceId());
    }

    /**
     * Forecasts the next 30 days of daily cost using a least-squares linear trend model (y = mx + c)
     */
    public List<CostForecastDTO> getCostTrendsAndForecast() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<CostRecord> records = costRecordRepository.findByDateBetweenOrderByDateAsc(start, end);

        // Group historical costs by date
        Map<LocalDate, Double> dailyCosts = records.stream()
                .collect(Collectors.groupingBy(
                        CostRecord::getDate,
                        Collectors.summingDouble(CostRecord::getCostAmount)
                ));

        List<CostForecastDTO> results = new ArrayList<>();
        int n = 30; // 30 days of historical data
        double[] x = new double[n];
        double[] y = new double[n];

        LocalDate temp = start;
        for (int i = 0; i < n; i++) {
            x[i] = i;
            y[i] = dailyCosts.getOrDefault(temp, 0.0);
            
            results.add(CostForecastDTO.builder()
                    .date(temp.toString())
                    .actualSpend(y[i])
                    .forecastSpend(null)
                    .build());
            
            temp = temp.plusDays(1);
        }

        // Fit linear regression: y = mx + c
        double sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (int i = 0; i < n; i++) {
            sumX += x[i];
            sumY += y[i];
            sumXY += x[i] * y[i];
            sumXX += x[i] * x[i];
        }

        double denominator = (n * sumXX - sumX * sumX);
        double m = (denominator == 0) ? 0 : (n * sumXY - sumX * sumY) / denominator;
        double c = (sumY - m * sumX) / n;

        // Forecast next 30 days
        // To overlap smoothly, the 1st forecast point can start on the last actual day or next day
        LocalDate forecastDate = end.plusDays(1);
        for (int i = 0; i < 30; i++) {
            double forecastValue = m * (n + i) + c;
            if (forecastValue < 0) forecastValue = 0; // Prevent negative spend

            results.add(CostForecastDTO.builder()
                    .date(forecastDate.toString())
                    .actualSpend(null)
                    .forecastSpend(Math.round(forecastValue * 100.0) / 100.0)
                    .build());

            forecastDate = forecastDate.plusDays(1);
        }

        return results;
    }
}
