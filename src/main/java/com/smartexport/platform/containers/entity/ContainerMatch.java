package com.smartexport.platform.containers.entity;

import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cont_match")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private ContainerOffer offer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private ContainerRequest request;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "compatibility_score")
    private Double compatibilityScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ContainerMatchStatus status = ContainerMatchStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
