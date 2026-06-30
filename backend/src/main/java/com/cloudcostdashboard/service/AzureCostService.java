package com.cloudcostdashboard.service;

import com.azure.core.credential.TokenCredential;
import com.azure.identity.DefaultAzureCredentialBuilder;
import com.azure.resourcemanager.AzureResourceManager;
import com.azure.core.management.profile.AzureProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AzureCostService {

    private final MockDataGeneratorService mockDataGenerator;
    private final boolean useMockData;

    public AzureCostService(MockDataGeneratorService mockDataGenerator,
                            @Value("${app.use-mock-data:true}") boolean useMockData) {
        this.mockDataGenerator = mockDataGenerator;
        this.useMockData = useMockData;
    }

    public void collectAzureData() {
        if (useMockData) {
            log.info("USE_MOCK_DATA is active. Generating mock Azure billing & metric data.");
            mockDataGenerator.generateMockData();
            return;
        }

        log.info("Attempting real Azure cost data collection...");
        try {
            TokenCredential credential = new DefaultAzureCredentialBuilder().build();
            AzureProfile profile = new AzureProfile(com.azure.core.management.AzureEnvironment.AZURE);
            AzureResourceManager azure = AzureResourceManager
                    .configure()
                    .authenticate(credential, profile)
                    .withDefaultSubscription();
            
            log.info("Successfully authenticated Azure Resource Manager. Resources count: {}", azure.resourceGroups().list().stream().count());
        } catch (Exception e) {
            log.warn("Failed to collect real Azure data (expected without live credentials): {}", e.getMessage());
            log.info("Falling back to mock Azure data generation.");
            mockDataGenerator.generateMockData();
        }
    }
}
