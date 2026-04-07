package com.smartexport.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortDto {
    
    private Long id;
    
    @NotBlank(message = "Le nom du port est requis")
    private String nomPort;
    
    @NotBlank(message = "Le pays est requis")
    private String pays;
    
    @NotBlank(message = "Le type de port est requis")
    @Pattern(regexp = "Maritime|Aérien", message = "Le type de port doit être 'Maritime' ou 'Aérien'")
    private String typePort;
    
    @DecimalMin(value = "0.0", message = "Les frais portuaires doivent être >= 0")
    private BigDecimal fraisPortuaires;
}
