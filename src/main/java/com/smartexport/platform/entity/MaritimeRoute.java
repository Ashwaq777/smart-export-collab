package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maritime_routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MaritimeRoute {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_port_id", nullable = false)
    private Port originPort;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_port_id", nullable = false)
    private Port destinationPort;
    
    @Column(name = "distance_nm", precision = 10, scale = 2)
    private BigDecimal distanceNm;
    
    @Column(name = "distance_km", precision = 10, scale = 2)
    private BigDecimal distanceKm;
    
    @Column(name = "estimated_days")
    private Integer estimatedDays;
    
    @Column(name = "bunker_surcharge", precision = 10, scale = 2)
    private BigDecimal bunkerSurcharge;
    
    @Column(name = "canal_fees", precision = 10, scale = 2)
    private BigDecimal canalFees;
    
    @Column(name = "security_surcharge", precision = 10, scale = 2)
    private BigDecimal securitySurcharge;
    
    @Column(name = "data_source")
    private String dataSource;
    
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }
}
