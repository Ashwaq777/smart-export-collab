package com.smartexport.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartexport.platform.entity.ProductionInfo;
import com.smartexport.platform.entity.TraceabilityRecord;

public interface ProductionInfoRepository extends JpaRepository<ProductionInfo, Long> {

    ProductionInfo findByRecord(TraceabilityRecord record);
}