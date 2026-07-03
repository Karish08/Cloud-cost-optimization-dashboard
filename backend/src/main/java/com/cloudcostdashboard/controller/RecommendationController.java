package com.cloudcostdashboard.controller;

import com.cloudcostdashboard.dto.CloudResourceDTO;
import com.cloudcostdashboard.dto.MessageResponse;
import com.cloudcostdashboard.dto.RecommendationDTO;
import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.entity.User;
import com.cloudcostdashboard.repository.RecommendationRepository;
import com.cloudcostdashboard.repository.UserRepository;
import com.cloudcostdashboard.service.RecommendationEngineService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final RecommendationRepository recommendationRepository;
    private final RecommendationEngineService recommendationEngineService;
    private final UserRepository userRepository;

    public RecommendationController(RecommendationRepository recommendationRepository,
                                    RecommendationEngineService recommendationEngineService,
                                    UserRepository userRepository) {
        this.recommendationRepository = recommendationRepository;
        this.recommendationEngineService = recommendationEngineService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.authentication.BadCredentialsException("User not authenticated");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authentication.getName()));
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

    private RecommendationDTO mapToDTO(Recommendation rec) {
        if (rec == null) return null;
        return RecommendationDTO.builder()
                .id(rec.getId())
                .resource(mapToDTO(rec.getResource()))
                .actionType(rec.getActionType())
                .currentCostPerMonth(rec.getCurrentCostPerMonth())
                .estimatedSavingsPerMonth(rec.getEstimatedSavingsPerMonth())
                .reasoning(rec.getReasoning())
                .isApplied(rec.isApplied())
                .build();
    }

    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getAllRecommendations() {
        List<Recommendation> recommendations = recommendationRepository.findByResourceUser(getCurrentUser());
        List<RecommendationDTO> dtos = recommendations.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyRecommendation(@PathVariable Long id) {
        try {
            User user = getCurrentUser();
            Recommendation rec = recommendationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Recommendation not found: " + id));
            if (rec.getResource() == null || rec.getResource().getUser() == null ||
                !rec.getResource().getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("Access denied: recommendation does not belong to your account"));
            }
            recommendationEngineService.applyRecommendation(id);
            return ResponseEntity.ok(new MessageResponse("Recommendation applied successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
