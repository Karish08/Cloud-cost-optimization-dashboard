package com.cloudcostdashboard.repository;

import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.Recommendation;
import com.cloudcostdashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByResource(CloudResource resource);
    List<Recommendation> findByIsApplied(boolean isApplied);

    List<Recommendation> findByResourceUser(User user);
    List<Recommendation> findByIsAppliedAndResourceUser(boolean isApplied, User user);
    void deleteByResourceUser(User user);
}
