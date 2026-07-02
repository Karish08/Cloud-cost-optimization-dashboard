package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.dto.CloudResourceDTO;
import com.cloudcostdashboard.dto.ResourceAnalysisResponse;
import com.cloudcostdashboard.dto.ResourceRequest;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.UsageMetric;
import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import com.cloudcostdashboard.repository.UsageMetricRepository;
import com.cloudcostdashboard.repository.RecommendationRepository;
import com.cloudcostdashboard.service.RecommendationEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
public class CloudResourceController {

    private final CloudResourceRepository resourceRepository;
    private final UsageMetricRepository usageMetricRepository;
    private final RecommendationRepository recommendationRepository;
    private final RecommendationEngineService recommendationEngineService;

    public CloudResourceController(CloudResourceRepository resourceRepository,
                                   UsageMetricRepository usageMetricRepository,
                                   RecommendationRepository recommendationRepository,
                                   RecommendationEngineService recommendationEngineService) {
        this.resourceRepository = resourceRepository;
        this.usageMetricRepository = usageMetricRepository;
        this.recommendationRepository = recommendationRepository;
        this.recommendationEngineService = recommendationEngineService;
    }

    private CloudResourceDTO mapToDTO(CloudResource resource) {
        if (resource == null) return null;
        return CloudResourceDTO.builder()
                .id(resource.getId())
                .provider(resource.getProvider())
                .resourceId(resource.getResourceId())
                .name(resource.getName())
                .resourceType(resource.getResourceType())
                .region(resource.getRegion())
                .status(resource.getStatus())
                .costPerDay(resource.getCostPerDay())
                .build();
    }

    @GetMapping
    public ResponseEntity<List<CloudResourceDTO>> getAllResources() {
        List<CloudResource> resources = resourceRepository.findAll();
        List<CloudResourceDTO> dtos = resources.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CloudResourceDTO> getResourceById(@PathVariable Long id) {
        return resourceRepository.findById(id)
                .map(this::mapToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ResourceAnalysisResponse> createResource(@RequestBody ResourceRequest request) {
        // Generate a provider-specific unique resourceId
        String resourceId;
        if ("AWS".equalsIgnoreCase(request.getProvider())) {
            resourceId = "i-" + UUID.randomUUID().toString().substring(0, 17).replace("-", "");
        } else if ("AZURE".equalsIgnoreCase(request.getProvider())) {
            resourceId = "/subscriptions/manual-sub/resourceGroups/rg-manual/providers/Microsoft.Compute/virtualMachines/manual-" + UUID.randomUUID().toString().substring(0, 8);
        } else {
            resourceId = "projects/manual-project/zones/" + request.getRegion() + "-a/instances/manual-" + UUID.randomUUID().toString().substring(0, 8);
        }

        // 1. Create and save CloudResource
        CloudResource resource = CloudResource.builder()
                .provider(request.getProvider().toUpperCase())
                .resourceId(resourceId)
                .name(request.getResourceName())
                .resourceType(request.getResourceType().toUpperCase())
                .region(request.getRegion())
                .status("HEALTHY")
                .costPerDay(request.getCostPerDay())
                .build();
        resource = resourceRepository.save(resource);

        // 2. Compute utilization values and save UsageMetric
        double cpuUtilization = request.getAllocatedCpuPercent() > 0 
                ? (request.getActualCpuPercent() / request.getAllocatedCpuPercent()) * 100.0 
                : request.getActualCpuPercent();
        double memoryUtilization = request.getAllocatedMemoryGB() > 0 
                ? (request.getActualUsedMemoryGB() / request.getAllocatedMemoryGB()) * 100.0 
                : 0.0;

        UsageMetric metric = UsageMetric.builder()
                .resource(resource)
                .cpuUtilization(cpuUtilization)
                .memoryUtilization(memoryUtilization)
                .storageUsedGB(request.getResourceType().equalsIgnoreCase("STORAGE") ? request.getActualUsedMemoryGB() : 0.0)
                .networkUsageGB(0.0)
                .storageReadWriteOps(0.0) // 0 ops will trigger UNUSED_STORAGE for STORAGE resources
                .timestamp(LocalDateTime.now())
                .build();
        usageMetricRepository.save(metric);

        // 3. Trigger RecommendationEngine analysis
        recommendationEngineService.runAnalysis();

        // 4. Retrieve analyzed status and recommendation details
        CloudResource updatedResource = resourceRepository.findById(resource.getId())
                .orElseThrow(() -> new IllegalStateException("Resource not found after analysis"));

        List<Recommendation> recommendations = recommendationRepository.findByResource(updatedResource);
        double estimatedSavings = 0.0;
        String actionType = "NONE";
        String reasoning = "The resource is operating efficiently and within normal utilization thresholds.";

        if (!recommendations.isEmpty()) {
            Recommendation rec = recommendations.get(0);
            estimatedSavings = rec.getEstimatedSavingsPerMonth();
            actionType = rec.getActionType();
            reasoning = rec.getReasoning();
        }

        ResourceAnalysisResponse response = new ResourceAnalysisResponse(
                mapToDTO(updatedResource),
                updatedResource.getStatus(),
                estimatedSavings,
                actionType,
                reasoning
        );

        return ResponseEntity.ok(response);
    }
}
