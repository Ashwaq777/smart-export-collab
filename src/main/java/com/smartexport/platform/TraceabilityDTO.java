package com.smartexport.platform.DTO;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TraceabilityDTO {

    // PRODUCT
    private String gtin;
    private String description;
    private String commercialLot;
    private String sanitaryLot;
    private Double quantity;
    private String unit;

    // PRODUCTION
    private String countryOfOrigin;
    private String productionSiteName;
    private String productionSiteAddress;
    private String sanitaryApprovalNumber;
    private LocalDate productionDate;
    private LocalDate harvestDate;

    // SHIPPING
    private String shipperName;
    private String shipperAddress;
    private String shipperGLN;
    private LocalDateTime shippingDateTime;
    private String transportMode;
    private Double transportTemperature;
    
    // LEGACY FIELDS FOR COMPATIBILITY
    private String producteur;
    private String parcelle;
    private LocalDate dateRecolte;
    private String destination;
}
