package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.dto.CostForecastDTO;
import com.cloudcostdashboard.dto.CostRecordDTO;
import com.cloudcostdashboard.dto.CostSummary;
import com.cloudcostdashboard.dto.MessageResponse;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.CostRecord;
import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import com.cloudcostdashboard.repository.CostRecordRepository;
import com.cloudcostdashboard.repository.RecommendationRepository;
import com.cloudcostdashboard.service.RecommendationEngineService;
import com.cloudcostdashboard.service.MockDataGeneratorService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/costs")
public class CostController {

    private final CostRecordRepository costRecordRepository;
    private final CloudResourceRepository resourceRepository;
    private final RecommendationRepository recommendationRepository;
    private final RecommendationEngineService recommendationEngineService;
    private final MockDataGeneratorService mockDataGenerator;

    public CostController(CostRecordRepository costRecordRepository,
                          CloudResourceRepository resourceRepository,
                          RecommendationRepository recommendationRepository,
                          RecommendationEngineService recommendationEngineService,
                          MockDataGeneratorService mockDataGenerator) {
        this.costRecordRepository = costRecordRepository;
        this.resourceRepository = resourceRepository;
        this.recommendationRepository = recommendationRepository;
        this.recommendationEngineService = recommendationEngineService;
        this.mockDataGenerator = mockDataGenerator;
    }

    private CostRecordDTO mapToDTO(CostRecord record) {
        if (record == null) return null;
        return CostRecordDTO.builder()
                .id(record.getId())
                .provider(record.getProvider())
                .serviceName(record.getServiceName())
                .costAmount(record.getCostAmount())
                .date(record.getDate())
                .build();
    }

    @GetMapping("/summary")
    public ResponseEntity<CostSummary> getCostSummary() {
        // Calculate Total Spend in last 30 days
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        List<CostRecord> records = costRecordRepository.findByDateBetweenOrderByDateAsc(start, end);
        double totalSpent30Days = records.stream()
                .mapToDouble(CostRecord::getCostAmount)
                .sum();

        // Calculate Monthly Run Rate (sum of costPerDay * 30 for all resources)
        List<CloudResource> resources = resourceRepository.findAll();
        double monthlyRunRate = resources.stream()
                .mapToDouble(res -> res.getCostPerDay() * 30.0)
                .sum();

        // Calculate Potential Monthly Savings (sum of estimatedSavingsPerMonth for unapplied recommendations)
        List<Recommendation> recommendations = recommendationRepository.findAll();
        double potentialSavings = recommendations.stream()
                .filter(rec -> !rec.isApplied())
                .mapToDouble(Recommendation::getEstimatedSavingsPerMonth)
                .sum();

        // Round off to 2 decimal places
        totalSpent30Days = Math.round(totalSpent30Days * 100.0) / 100.0;
        monthlyRunRate = Math.round(monthlyRunRate * 100.0) / 100.0;
        potentialSavings = Math.round(potentialSavings * 100.0) / 100.0;

        return ResponseEntity.ok(new CostSummary(totalSpent30Days, monthlyRunRate, potentialSavings));
    }

    @GetMapping("/records")
    public ResponseEntity<List<CostRecordDTO>> getCostRecords(
            @RequestParam(required = false) String provider,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<CostRecord> records;
        if (startDate != null && endDate != null) {
            if (provider != null && !provider.trim().isEmpty()) {
                records = costRecordRepository.findByProviderAndDateBetweenOrderByDateAsc(provider, startDate, endDate);
            } else {
                records = costRecordRepository.findByDateBetweenOrderByDateAsc(startDate, endDate);
            }
        } else if (provider != null && !provider.trim().isEmpty()) {
            records = costRecordRepository.findByProvider(provider);
        } else {
            records = costRecordRepository.findAll();
        }

        List<CostRecordDTO> dtos = records.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/forecast")
    public ResponseEntity<List<CostForecastDTO>> getCostForecast() {
        List<CostForecastDTO> forecast = recommendationEngineService.getCostTrendsAndForecast();
        return ResponseEntity.ok(forecast);
    }
 
    @PostMapping("/sync")
    public ResponseEntity<?> syncData() {
        mockDataGenerator.generateMockData(true);
        return ResponseEntity.ok(new MessageResponse("Synchronization successful"));
    }
}
