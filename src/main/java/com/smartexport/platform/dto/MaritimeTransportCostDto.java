package com.smartexport.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaritimeTransportCostDto {
    
    private String vesselMmsi;
    private String vesselName;
    
    private String originPortName;
    private String destPortName;
    private BigDecimal distanceNm;
    private BigDecimal distanceKm;
    private Integer estimatedDays;
    
    private BigDecimal weightTonnes;
    private String containerType;
    private String incoterm;
    
    private BigDecimal freightCost;
    private BigDecimal originPortFees;
    private BigDecimal destPortFees;
    private BigDecimal bunkerSurcharge;
    private BigDecimal canalFees;
    private BigDecimal securitySurcharge;
    private BigDecimal insuranceCost;
    
    private BigDecimal totalCost;
    
    private String currency;
    private String dataSource;
}
