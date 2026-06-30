package com.cloudcostdashboard.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.costexplorer.CostExplorerClient;
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageRequest;
import software.amazon.awssdk.services.costexplorer.model.GetCostAndUsageResponse;
import software.amazon.awssdk.services.ec2.Ec2Client;
import software.amazon.awssdk.services.ec2.model.DescribeInstancesRequest;

@Service
@Slf4j
public class AwsCostService {

    private final MockDataGeneratorService mockDataGenerator;
    private final boolean useMockData;

    public AwsCostService(MockDataGeneratorService mockDataGenerator,
                          @Value("${app.use-mock-data:true}") boolean useMockData) {
        this.mockDataGenerator = mockDataGenerator;
        this.useMockData = useMockData;
    }

    public void collectAwsData() {
        if (useMockData) {
            log.info("USE_MOCK_DATA is active. Generating mock AWS billing & metric data.");
            mockDataGenerator.generateMockData();
            return;
        }

        log.info("Attempting real AWS cost data collection...");
        try (CostExplorerClient ceClient = CostExplorerClient.builder().region(Region.US_EAST_1).build();
             Ec2Client ec2Client = Ec2Client.builder().region(Region.US_EAST_1).build()) {
            
            // Perform dummy SDK operations to verify SDK loading
            DescribeInstancesRequest describeRequest = DescribeInstancesRequest.builder().maxResults(5).build();
            ec2Client.describeInstances(describeRequest);
            
            GetCostAndUsageRequest costRequest = GetCostAndUsageRequest.builder().build();
            GetCostAndUsageResponse costResponse = ceClient.getCostAndUsage(costRequest);
            log.info("AWS Cost Explorer response: {}", costResponse);
        } catch (Exception e) {
            log.warn("Failed to collect real AWS data (this is expected without live credentials): {}", e.getMessage());
            log.info("Falling back to mock AWS data generation.");
            mockDataGenerator.generateMockData();
        }
    }
}
