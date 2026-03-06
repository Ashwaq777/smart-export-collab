package com.smartexport.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartexport.platform.entity.ShippingEvent;
import com.smartexport.platform.entity.TraceabilityRecord;

public interface ShippingEventRepository extends JpaRepository<ShippingEvent, Long> {

    ShippingEvent findFirstByRecord(TraceabilityRecord record);
}
