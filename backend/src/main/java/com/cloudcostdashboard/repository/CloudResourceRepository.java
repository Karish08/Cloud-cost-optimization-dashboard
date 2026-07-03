package com.cloudcostdashboard.repository;

import com.cloudcostdashboard.entity.CloudResource;
import com.cloudcostdashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CloudResourceRepository extends JpaRepository<CloudResource, Long> {
    Optional<CloudResource> findByResourceId(String resourceId);
    List<CloudResource> findByProvider(String provider);

    List<CloudResource> findByUser(User user);
    Optional<CloudResource> findByResourceIdAndUser(String resourceId, User user);
    List<CloudResource> findByProviderAndUser(String provider, User user);
    long countByUser(User user);
    void deleteByUser(User user);
}
