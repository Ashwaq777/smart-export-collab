package com.smartexport.platform.containers.entity;

import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
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
@Table(name = "cont_request")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;

    @Enumerated(EnumType.STRING)
    @Column(name = "container_type", nullable = false)
    private ContainerType containerType;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo_type")
    private CargoType cargoType;

    @Column(name = "size")
    private String size;

    @Column(name = "loading_location", nullable = false)
    private String loadingLocation;

    @Column(name = "loading_latitude")
    private Double loadingLatitude;

    @Column(name = "loading_longitude")
    private Double loadingLongitude;

    @Column(name = "required_date", nullable = false)
    private LocalDate requiredDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContainerRequestStatus status = ContainerRequestStatus.SEARCHING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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
