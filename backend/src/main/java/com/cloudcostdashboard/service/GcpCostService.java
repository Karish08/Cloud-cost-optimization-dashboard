package com.cloudcostdashboard.service;

import com.google.cloud.billing.v1.CloudBillingClient;
import com.google.cloud.billing.v1.ListBillingAccountsRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class GcpCostService {

    private final MockDataGeneratorService mockDataGenerator;
    private final boolean useMockData;

    public GcpCostService(MockDataGeneratorService mockDataGenerator,
                          @Value("${app.use-mock-data:true}") boolean useMockData) {
        this.mockDataGenerator = mockDataGenerator;
        this.useMockData = useMockData;
    }

    public void collectGcpData() {
        if (useMockData) {
            log.info("USE_MOCK_DATA is active. Generating mock GCP billing & metric data.");
            mockDataGenerator.generateMockData();
            return;
        }

        log.info("Attempting real GCP cost data collection...");
        try (CloudBillingClient billingClient = CloudBillingClient.create()) {
            ListBillingAccountsRequest request = ListBillingAccountsRequest.newBuilder().build();
            billingClient.listBillingAccounts(request);
            log.info("Successfully listed billing accounts on Google Cloud Client.");
        } catch (Exception e) {
            log.warn("Failed to collect real GCP data (expected without live credentials): {}", e.getMessage());
            log.info("Falling back to mock GCP data generation.");
            mockDataGenerator.generateMockData();
        }
    }
}
