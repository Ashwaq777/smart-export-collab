package com.smartexport.platform.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "traceability_records")
@Getter
@Setter
public class TraceabilityRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String traceabilityLotCode;

    private String status; // DRAFT / VALIDATED / LOCKED

    private String createdBy;

    private LocalDateTime createdAt;

    private Integer version;
}