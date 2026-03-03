package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "siv_prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SivPrice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_hs", nullable = false, length = 10)
    private String codeHs;
    
    @Column(nullable = false, length = 100)
    private String categorie;
    
    @Column(name = "country_region", nullable = false, length = 50)
    private String countryRegion;
    
    @Column(name = "min_entry_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal minEntryPrice;
    
    @Column(length = 3)
    private String currency;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
