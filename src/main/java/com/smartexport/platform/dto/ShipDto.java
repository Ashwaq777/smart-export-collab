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
public class ShipDto {
    
    private Long id;
    private String name;
    private String imoNumber;
    private String companyName;
    private String companyCode;
    private String vesselType;
    private Integer teuCapacity;
    private Integer feuCapacity;
    private BigDecimal averageSpeed;
    private String flag;
    private String dataSource;
}
