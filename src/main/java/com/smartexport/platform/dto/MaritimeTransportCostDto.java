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
    
    public String vesselMmsi;
    public String vesselName;
    
    public String originPortName;
    public String destPortName;
    public BigDecimal distanceNm;
    public BigDecimal distanceKm;
    public Integer estimatedDays;
    
    public BigDecimal weightTonnes;
    public String containerType;
    public String incoterm;
    
    public BigDecimal freightCost;
    public BigDecimal originPortFees;
    public BigDecimal destPortFees;
    public BigDecimal bunkerSurcharge;
    public BigDecimal canalFees;
    public BigDecimal securitySurcharge;
    public BigDecimal insuranceCost;
    
    public BigDecimal totalCost;
    
    public String currency;
    public String dataSource;
}
