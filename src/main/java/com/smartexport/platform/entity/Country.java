package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "countries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Country {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 3)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String region;
    
    private String subregion;
    
    @Column(name = "customs_duty_rate")
    private Double customsDutyRate;
    
    @Column(name = "vat_rate")
    private Double vatRate;
    
    @Column(name = "parafiscal_rate")
    private Double parafiscalRate;
    
    @Column(name = "port_fees")
    private Double portFees;
    
    @Column(name = "flag_url")
    private String flagUrl;
    
    @Column(name = "currency", length = 10)
    private String currency;
    
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
