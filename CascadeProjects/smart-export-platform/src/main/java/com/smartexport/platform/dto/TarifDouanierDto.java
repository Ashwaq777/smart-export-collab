package com.smartexport.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TarifDouanierDto {
    
    private Long id;
    
    @NotBlank(message = "Le code HS est requis")
    @Pattern(regexp = "^\\d{2,10}$", message = "Le code HS doit contenir entre 2 et 10 chiffres (sans points ni espaces)")
    private String codeHs;
    
    @NotBlank(message = "Le nom du produit est requis")
    private String nomProduit;
    
    @NotBlank(message = "La catégorie est requise")
    private String categorie;
    
    @NotBlank(message = "Le pays de destination est requis")
    private String paysDestination;
    
    @NotNull(message = "Le taux de douane est requis")
    @DecimalMin(value = "0.0", message = "Le taux de douane doit être >= 0")
    private BigDecimal tauxDouane;
    
    @NotNull(message = "Le taux de TVA est requis")
    @DecimalMin(value = "0.0", message = "Le taux de TVA doit être >= 0")
    private BigDecimal tauxTva;
    
    @NotNull(message = "La taxe parafiscale est requise")
    @DecimalMin(value = "0.0", message = "La taxe parafiscale doit être >= 0")
    private BigDecimal taxeParafiscale;
}
