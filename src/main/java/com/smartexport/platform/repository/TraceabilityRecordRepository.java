package com.smartexport.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartexport.platform.entity.TraceabilityRecord;

public interface TraceabilityRecordRepository extends JpaRepository<TraceabilityRecord, Long> {
    long count();
}