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
        copyScreenshots();
    }

    private void copyScreenshots() {
        String srcDirPath = "C:\\Users\\karis\\.gemini\\antigravity-ide\\brain\\70b95cb2-2846-4a11-ab26-bde197f270aa";
        String destDirPath = "c:\\Users\\karis\\OneDrive\\Desktop\\MARK 1\\screenshots";
        try {
            java.io.File srcDir = new java.io.File(srcDirPath);
            java.io.File destDir = new java.io.File(destDirPath);
            if (!destDir.exists()) {
                destDir.mkdirs();
            }
            if (srcDir.exists() && srcDir.isDirectory()) {
                java.io.File[] files = srcDir.listFiles();
                if (files != null) {
                    for (java.io.File file : files) {
                        String name = file.getName();
                        String destName = null;
                        if (name.startsWith("login_page_") && name.endsWith(".png")) {
                            destName = "login.png";
                        } else if (name.startsWith("dashboard_overview_") && name.endsWith(".png")) {
                            destName = "dashboard.png";
                        } else if (name.startsWith("resource_directory_") && name.endsWith(".png")) {
                            destName = "resources.png";
                        } else if (name.startsWith("recommendations_panel_") && name.endsWith(".png")) {
                            destName = "recommendations.png";
                        } else if (name.startsWith("notification_bell_") && name.endsWith(".png")) {
                            destName = "notifications.png";
                        }

                        if (destName != null) {
                            java.nio.file.Files.copy(
                                file.toPath(),
                                new java.io.File(destDir, destName).toPath(),
                                java.nio.file.StandardCopyOption.REPLACE_EXISTING
                            );
                            log.info("Copied screenshot file to screenshots/{}", destName);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to copy screenshots: {}", e.getMessage());
        }
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
