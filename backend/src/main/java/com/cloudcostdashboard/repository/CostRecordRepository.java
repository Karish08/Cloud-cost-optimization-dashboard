package com.cloudcostdashboard.repository;

import com.cloudcostdashboard.entity.CostRecord;
import com.cloudcostdashboard.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {
    List<CostRecord> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProviderAndDateBetweenOrderByDateAsc(String provider, LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProvider(String provider);

    List<CostRecord> findByUser(User user);
    List<CostRecord> findByUserAndDateBetweenOrderByDateAsc(User user, LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProviderAndUserAndDateBetweenOrderByDateAsc(String provider, User user, LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProviderAndUser(String provider, User user);
    void deleteByUser(User user);
}
