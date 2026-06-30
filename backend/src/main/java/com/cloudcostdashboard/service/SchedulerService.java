package com.cloudcostdashboard.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SchedulerService {

    private final AwsCostService awsCostService;
    private final AzureCostService azureCostService;
    private final GcpCostService gcpCostService;
    private final RecommendationEngineService recommendationEngine;

    public SchedulerService(AwsCostService awsCostService,
                            AzureCostService azureCostService,
                            GcpCostService gcpCostService,
                            RecommendationEngineService recommendationEngine) {
        this.awsCostService = awsCostService;
        this.azureCostService = azureCostService;
        this.gcpCostService = gcpCostService;
        this.recommendationEngine = recommendationEngine;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void runOnStartup() {
        log.info("Application ready! Triggering initial data collection and analysis...");
        collectAndAnalyze();
    }

    @Scheduled(cron = "${app.scheduler.cron:0 0 * * * *}")
    public void scheduledCollection() {
        log.info("Triggering scheduled data collection...");
        collectAndAnalyze();
    }

    private void collectAndAnalyze() {
        try {
            awsCostService.collectAwsData();
            azureCostService.collectAzureData();
            gcpCostService.collectGcpData();
            
            // Run recommendation algorithms
            recommendationEngine.runAnalysis();
            log.info("Data collection and analysis cycle finished successfully.");
        } catch (Exception e) {
            log.error("Error during data collection and analysis cycle", e);
        }
    }
}
