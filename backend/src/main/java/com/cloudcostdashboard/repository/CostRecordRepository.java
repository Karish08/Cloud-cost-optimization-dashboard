package com.cloudcostdashboard.repository;

import com.cloudcostdashboard.entity.CostRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface CostRecordRepository extends JpaRepository<CostRecord, Long> {
    List<CostRecord> findByDateBetweenOrderByDateAsc(LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProviderAndDateBetweenOrderByDateAsc(String provider, LocalDate startDate, LocalDate endDate);
    List<CostRecord> findByProvider(String provider);
}
