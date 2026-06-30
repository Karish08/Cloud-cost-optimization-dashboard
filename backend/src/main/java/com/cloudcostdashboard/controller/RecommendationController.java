package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.repository.RecommendationRepository;
import com.cloudcostdashboard.service.RecommendationEngineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationEngineService recommendationEngineService;

    public RecommendationController(RecommendationRepository recommendationRepository,
                                    RecommendationEngineService recommendationEngineService) {
        this.recommendationRepository = recommendationRepository;
        this.recommendationEngineService = recommendationEngineService;
    }

    @GetMapping
    public ResponseEntity<List<Recommendation>> getAllRecommendations() {
        List<Recommendation> recommendations = recommendationRepository.findAll();
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyRecommendation(@PathVariable Long id) {
        try {
            recommendationEngineService.applyRecommendation(id);
            return ResponseEntity.ok(Map.of("message", "Recommendation applied successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
