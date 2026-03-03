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
public class RisqueChangeDto {
    
    private String deviseSource;
    private String deviseCible;
    private BigDecimal tauxActuel;
    private BigDecimal montantInitial;
    
    private BigDecimal sensibilite1Pourcent;
    private BigDecimal impactMarge1Pourcent;
    
    private String indicateurRisque;
    private String recommandation;
    private String sourceData;
}
