package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ProductIdentification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gtin;
    private String description;
    private String commercialLot;
    private String sanitaryLot;
    private Double quantity;
    private String unit;

    @OneToOne
    @JoinColumn(name = "record_id")
    private TraceabilityRecord record;
}