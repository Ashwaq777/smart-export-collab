package com.smartexport.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartexport.platform.entity.TraceabilityHistory;

@Repository
public interface TraceabilityHistoryRepository extends JpaRepository<TraceabilityHistory, Long> {

    List<TraceabilityHistory> findByRecordIdOrderByVersionDesc(Long recordId);
}
