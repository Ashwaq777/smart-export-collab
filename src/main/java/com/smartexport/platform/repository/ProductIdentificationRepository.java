package com.smartexport.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.smartexport.platform.entity.ProductIdentification;
import com.smartexport.platform.entity.TraceabilityRecord;

public interface ProductIdentificationRepository 
        extends JpaRepository<ProductIdentification, Long> {

            ProductIdentification findByRecord(TraceabilityRecord record);
}