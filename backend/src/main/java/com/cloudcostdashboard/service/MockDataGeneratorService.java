package com.cloudcostdashboard.service;

import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.CostRecord;
import com.cloudcostdashboard.entity.UsageMetric;
import com.cloudcostdashboard.repository.CloudResourceRepository;
import com.cloudcostdashboard.repository.CostRecordRepository;
import com.cloudcostdashboard.repository.UsageMetricRepository;
import com.cloudcostdashboard.repository.RecommendationRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MockDataGeneratorService {

    private final CloudResourceRepository resourceRepository;
    private final UsageMetricRepository metricRepository;
    private final CostRecordRepository costRecordRepository;
    private final RecommendationRepository recommendationRepository;
    private final RecommendationEngineService recommendationEngineService;
    private final Random random = new Random();

    public MockDataGeneratorService(CloudResourceRepository resourceRepository,
                                    UsageMetricRepository metricRepository,
                                    CostRecordRepository costRecordRepository,
                                    RecommendationRepository recommendationRepository,
                                    @Lazy RecommendationEngineService recommendationEngineService) {
        this.resourceRepository = resourceRepository;
        this.metricRepository = metricRepository;
        this.costRecordRepository = costRecordRepository;
        this.recommendationRepository = recommendationRepository;
        this.recommendationEngineService = recommendationEngineService;
    }

    @Transactional
    public void generateMockData() {
        generateMockData(false);
    }

    @Transactional
    public void generateMockData(boolean forceReset) {
        if (forceReset) {
            recommendationRepository.deleteAllInBatch();
            metricRepository.deleteAllInBatch();
            costRecordRepository.deleteAllInBatch();
            resourceRepository.deleteAllInBatch();
        } else if (resourceRepository.count() > 0) {
            return; // Data already exists
        }

        List<CloudResource> resources = createMockResources();
        resourceRepository.saveAll(resources);

        // Generate 30 days of metrics for each resource
        List<UsageMetric> metrics = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        for (CloudResource res : resources) {
            for (int i = 29; i >= 0; i--) {
                LocalDateTime ts = now.minusDays(i);
                metrics.add(generateMetricForResource(res, ts));
            }
        }
        metricRepository.saveAll(metrics);

        // Generate 30 days of daily cost records per provider and service
        List<CostRecord> costRecords = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 29; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            
            // AWS Costs
            costRecords.add(new CostRecord(null, "AWS", "EC2", 40.0 + random.nextDouble() * 10 - 2, date));
            costRecords.add(new CostRecord(null, "AWS", "RDS", 25.0 + random.nextDouble() * 5 - 1, date));
            costRecords.add(new CostRecord(null, "AWS", "S3", 10.0 + random.nextDouble() * 2 - 0.5, date));

            // Azure Costs
            costRecords.add(new CostRecord(null, "AZURE", "Virtual Machines", 35.0 + random.nextDouble() * 8 - 2, date));
            costRecords.add(new CostRecord(null, "AZURE", "SQL Database", 20.0 + random.nextDouble() * 4 - 1, date));
            costRecords.add(new CostRecord(null, "AZURE", "Blob Storage", 8.0 + random.nextDouble() * 2 - 0.5, date));

            // GCP Costs
            costRecords.add(new CostRecord(null, "GCP", "Compute Engine", 30.0 + random.nextDouble() * 6 - 2, date));
            costRecords.add(new CostRecord(null, "GCP", "Cloud SQL", 18.0 + random.nextDouble() * 3 - 1, date));
            costRecords.add(new CostRecord(null, "GCP", "Cloud Storage", 6.0 + random.nextDouble() * 1.5 - 0.5, date));
        }
        costRecordRepository.saveAll(costRecords);
 
        // Force flush to the database so the JPQL/SQL query in runAnalysis() can locate the metrics
        resourceRepository.flush();
        metricRepository.flush();
        costRecordRepository.flush();
        
        // Run recommendation analysis immediately to generate recommendation records
        recommendationEngineService.runAnalysis();
        recommendationRepository.flush();
    }

    private List<CloudResource> createMockResources() {
        List<CloudResource> list = new ArrayList<>();

        // AWS
        list.add(CloudResource.builder()
                .provider("AWS")
                .resourceId("i-0a816c278bf992e10")
                .name("Prod-Web-Server")
                .resourceType("COMPUTE")
                .region("us-east-1")
                .status("HEALTHY")
                .costPerDay(15.50)
                .build());

        list.add(CloudResource.builder()
                .provider("AWS")
                .resourceId("i-0f81bc278bf234e99")
                .name("Dev-Testing-VM")
                .resourceType("COMPUTE")
                .region("us-west-2")
                .status("IDLE") // CPU < 5%
                .costPerDay(8.20)
                .build());

        list.add(CloudResource.builder()
                .provider("AWS")
                .resourceId("db-rds-postgresql-prod")
                .name("Prod-DB-Instance")
                .resourceType("DATABASE")
                .region("us-east-1")
                .status("HEALTHY")
                .costPerDay(22.80)
                .build());

        list.add(CloudResource.builder()
                .provider("AWS")
                .resourceId("vol-09a823bcde9012f")
                .name("Backup-EBS-Volume")
                .resourceType("STORAGE")
                .region("us-east-1")
                .status("UNUSED_STORAGE") // no read/write activity in 30 days
                .costPerDay(4.50)
                .build());

        // AZURE
        list.add(CloudResource.builder()
                .provider("AZURE")
                .resourceId("/subscriptions/sub1/resourceGroups/rg-prod/providers/Microsoft.Compute/virtualMachines/prod-vm-01")
                .name("prod-vm-01")
                .resourceType("COMPUTE")
                .region("eastus")
                .status("HEALTHY")
                .costPerDay(12.40)
                .build());

        list.add(CloudResource.builder()
                .provider("AZURE")
                .resourceId("/subscriptions/sub1/resourceGroups/rg-dev/providers/Microsoft.Compute/virtualMachines/dev-overprovisioned-vm")
                .name("dev-overprovisioned-vm")
                .resourceType("COMPUTE")
                .region("westeurope")
                .status("OVER_PROVISIONED") // CPU/memory < 20%
                .costPerDay(18.90)
                .build());

        list.add(CloudResource.builder()
                .provider("AZURE")
                .resourceId("/subscriptions/sub1/resourceGroups/rg-prod/providers/Microsoft.Sql/servers/sql-server-prod")
                .name("sql-server-prod")
                .resourceType("DATABASE")
                .region("eastus")
                .status("HEALTHY")
                .costPerDay(19.50)
                .build());

        // GCP
        list.add(CloudResource.builder()
                .provider("GCP")
                .resourceId("projects/p1/zones/us-central1-a/instances/gcp-app-engine-node")
                .name("gcp-app-engine-node")
                .resourceType("COMPUTE")
                .region("us-central1")
                .status("HEALTHY")
                .costPerDay(10.20)
                .build());

        list.add(CloudResource.builder()
                .provider("GCP")
                .resourceId("projects/p1/global/buckets/gcp-legacy-temp-logs")
                .name("gcp-legacy-temp-logs")
                .resourceType("STORAGE")
                .region("us-central1")
                .status("UNUSED_STORAGE") // read/write operations == 0
                .costPerDay(3.80)
                .build());

        list.add(CloudResource.builder()
                .provider("GCP")
                .resourceId("projects/p1/zones/us-east1-b/instances/gcp-analytics-db")
                .name("gcp-analytics-db")
                .resourceType("DATABASE")
                .region("us-east1")
                .status("OVER_PROVISIONED") // CPU/memory < 20%
                .costPerDay(28.40)
                .build());

        return list;
    }

    private UsageMetric generateMetricForResource(CloudResource res, LocalDateTime ts) {
        double cpu = 40.0 + random.nextDouble() * 20;
        double mem = 50.0 + random.nextDouble() * 15;
        double storage = 200.0 + random.nextDouble() * 10;
        double network = 1.5 + random.nextDouble() * 2.0;
        double ops = 1000 + random.nextInt(5000);

        if ("IDLE".equals(res.getStatus())) {
            cpu = 1.0 + random.nextDouble() * 3.5; // Always < 5%
            mem = 10.0 + random.nextDouble() * 5.0;
            ops = 5 + random.nextInt(10);
        } else if ("OVER_PROVISIONED".equals(res.getStatus())) {
            cpu = 5.0 + random.nextDouble() * 12.0; // < 20%
            mem = 8.0 + random.nextDouble() * 10.0;  // < 20%
            ops = 100 + random.nextInt(200);
        } else if ("UNUSED_STORAGE".equals(res.getStatus())) {
            cpu = 0;
            mem = 0;
            ops = 0; // 0 read/write activity in 30 days
            network = 0;
        }

        return UsageMetric.builder()
                .resource(res)
                .cpuUtilization(cpu)
                .memoryUtilization(mem)
                .storageUsedGB(storage)
                .networkUsageGB(network)
                .storageReadWriteOps(ops)
                .timestamp(ts)
                .build();
    }
}
