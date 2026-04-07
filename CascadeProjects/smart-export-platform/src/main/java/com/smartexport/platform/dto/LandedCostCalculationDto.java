package com.smartexport.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LandedCostCalculationDto {
    
    @NotBlank(message = "Le code HS est requis")
    private String codeHs;
    
    @NotBlank(message = "Le pays de destination est requis")
    private String paysDestination;
    
    @NotNull(message = "La valeur FOB est requise")
    @DecimalMin(value = "0.01", message = "La valeur FOB doit être > 0")
    private BigDecimal valeurFob;
    
    @NotNull(message = "Le coût de transport est requis")
    @DecimalMin(value = "0.0", message = "Le coût de transport doit être >= 0")
    private BigDecimal coutTransport;
    
    @NotNull(message = "L'assurance est requise")
    @DecimalMin(value = "0.0", message = "L'assurance doit être >= 0")
    private BigDecimal assurance;
    
    private String currency;
    
    private Long portId;
    
    // Legal identifiers
    private String nomEntreprise;
    private String registreCommerce;
    private String ice;
    
    // Incoterm
    private String incoterm; // FOB, CIF, etc.
    
    // Profitability
    private BigDecimal prixVentePrevisionnel;
    
    // Logistics details
    private BigDecimal poidsNet;
    private BigDecimal poidsBrut;
    private String typeUnite; // ex: conteneur 40'
}
