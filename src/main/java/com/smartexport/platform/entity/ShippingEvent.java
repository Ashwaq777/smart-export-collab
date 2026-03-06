package com.smartexport.platform.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class ShippingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String shipperName;
    private String shipperAddress;
    private String shipperGLN;
    private LocalDateTime shippingDateTime;
    private String transportMode;
    private Double transportTemperature;

    @ManyToOne
    @JoinColumn(name = "record_id")
    private TraceabilityRecord record;
}
