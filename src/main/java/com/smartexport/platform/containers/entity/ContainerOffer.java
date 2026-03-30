package com.smartexport.platform.containers.entity;

import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cont_offer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private User provider;

    @Enumerated(EnumType.STRING)
    @Column(name = "container_type", nullable = false)
    private ContainerType containerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo_type")
    private CargoType cargoType;

    @Column(name = "size")
    private String size;

    @Column(name = "technical_details")
    private String technicalDetails;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "port_name")
    private String portName;

    @Column(name = "available_date", nullable = false)
    private LocalDate availableDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContainerOfferStatus status = ContainerOfferStatus.AVAILABLE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "technical_condition")
    private String technicalCondition;

    @Column(name = "year_of_manufacture")
    private Integer yearOfManufacture;

    @Column(name = "container_number")
    private String containerNumber;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
