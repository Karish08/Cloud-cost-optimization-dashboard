package com.cloudcostdashboard.repository;

import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.UsageMetric;
import com.cloudcostdashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UsageMetricRepository extends JpaRepository<UsageMetric, Long> {
    List<UsageMetric> findByResourceOrderByTimestampAsc(CloudResource resource);
    List<UsageMetric> findByResourceAndTimestampAfterOrderByTimestampAsc(CloudResource resource, LocalDateTime timestamp);

    void deleteByResourceUser(User user);
}
