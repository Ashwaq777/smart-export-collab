package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Port {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "nom_port", nullable = false)
    private String nomPort;
    
    @Column(nullable = false)
    private String pays;
    
    @Column(name = "type_port", nullable = false)
    private String typePort;
    
    @Column(name = "frais_portuaires", precision = 10, scale = 2)
    private BigDecimal fraisPortuaires;
    
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
