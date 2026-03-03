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
public class MaritimeRouteDto {
    
    private Long id;
    private Long originPortId;
    private String originPortName;
    private String originCountry;
    private Long destinationPortId;
    private String destinationPortName;
    private String destinationCountry;
    private BigDecimal distanceNm;
    private BigDecimal distanceKm;
    private Integer estimatedDays;
    private BigDecimal bunkerSurcharge;
    private BigDecimal canalFees;
    private BigDecimal securitySurcharge;
    private String dataSource;
}
