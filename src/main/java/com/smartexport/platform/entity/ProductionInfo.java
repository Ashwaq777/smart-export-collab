package com.smartexport.platform.entity;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ProductionInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String countryOfOrigin;
    private String productionSiteName;
    private String productionSiteAddress;
    private String sanitaryApprovalNumber;
    private LocalDate productionDate;
    private LocalDate harvestDate;

    @OneToOne
    @JoinColumn(name = "record_id")
    private TraceabilityRecord record;
}