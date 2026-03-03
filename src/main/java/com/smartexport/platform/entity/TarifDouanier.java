package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "tarifs_douaniers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifDouanier {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_hs", nullable = false, length = 10)
    private String codeHs;
    
    @Column(name = "nom_produit", nullable = false)
    private String nomProduit;
    
    @Column(nullable = false)
    private String categorie;
    
    @Column(name = "pays_destination", nullable = false)
    private String paysDestination;
    
    @Column(name = "taux_douane", nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxDouane;
    
    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTva;
    
    @Column(name = "taxe_parafiscale", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxeParafiscale;
}
