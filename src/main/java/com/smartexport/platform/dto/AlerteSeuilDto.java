package com.smartexport.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlerteSeuilDto {
    
    private String codeHs;
    private String nomProduit;
    private BigDecimal valeurSaisie;
    private BigDecimal prixEntreeSivMin;
    private BigDecimal prixEntreeSivMax;
    
    private boolean alerteActive;
    private String typeAlerte;
    private String message;
    private BigDecimal tauxCompensatoire;
}
