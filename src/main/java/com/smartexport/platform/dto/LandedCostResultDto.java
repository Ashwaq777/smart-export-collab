package com.smartexport.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LandedCostResultDto {
    
    private String codeHs;
    private String nomProduit;
    private String paysDestination;
    
    private BigDecimal valeurFob;
    private BigDecimal coutTransport;
    private BigDecimal assurance;
    private BigDecimal valeurCaf;
    
    private BigDecimal tauxDouane;
    private BigDecimal montantDouane;
    
    private BigDecimal tauxTva;
    private BigDecimal montantTva;
    
    private BigDecimal taxeParafiscale;
    private BigDecimal montantTaxeParafiscale;
    
    private String nomPort;
    private BigDecimal fraisPortuaires;
    
    private BigDecimal coutTotal;
    
    private BigDecimal coutEstime;
    private BigDecimal varianceCout;
    private String variancePercentage;
    
    private String currency;
    private BigDecimal coutTotalEur;
    private BigDecimal coutTotalUsd;
    
    private String disclaimer;
    private String exchangeRateSource;
    private LocalDateTime calculationDate;
    
    // Legal identifiers
    private String nomEntreprise;
    private String registreCommerce;
    private String ice;
    
    // Unique simulation ID
    private String simulationId;
    
    // Profitability indicator
    private BigDecimal prixVentePrevisionnel;
    private BigDecimal margeNette;
    private BigDecimal margePourcentage;
    private String indicateurRentabilite; // POSITIF, NEGATIF, NEUTRE
    
    // SIV Alert
    private Boolean alerteSiv;
    private String messageSiv;
    private BigDecimal prixEntreeSivMin;
    
    // Currency sensitivity analysis
    private BigDecimal impactDevise2PourcentPlus;
    private BigDecimal impactDevise2PourcentMoins;
    
    // Logistics details
    private BigDecimal poidsNet;
    private BigDecimal poidsBrut;
    private String typeUnite;
    
    // Incoterm
    private String incoterm;
    
    // Data source tracking for fallback tariffs
    private String dataSource; // DATABASE, WTO_MFN_ESTIMATED, FALLBACK_ESTIMATED
    private String warningMessage; // Warning message for estimated data
    
    // Maritime transport details (optional)
    private MaritimeTransportCostDto maritimeTransport;
}
