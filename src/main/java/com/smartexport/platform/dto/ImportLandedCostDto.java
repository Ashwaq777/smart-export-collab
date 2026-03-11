package com.smartexport.platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class ImportLandedCostDto {
    
    @NotBlank(message = "Le pays d'origine est requis")
    @Size(max = 100, message = "Le nom du pays d'origine ne doit pas dépasser 100 caractères")
    private String paysOrigine;
    
    @NotBlank(message = "Le port d'embarquement est requis")
    @Size(max = 100, message = "Le nom du port d'embarquement ne doit pas dépasser 100 caractères")
    private String portEmbarquement;
    
    @NotBlank(message = "Le pays de destination est requis")
    @Size(max = 100, message = "Le nom du pays de destination ne doit pas dépasser 100 caractères")
    private String paysDestination;
    
    @NotBlank(message = "Le port de déchargement est requis")
    @Size(max = 100, message = "Le nom du port de déchargement ne doit pas dépasser 100 caractères")
    private String portDechargement;
    
    @NotNull(message = "La valeur FOB est requise")
    @DecimalMin(value = "0.01", message = "La valeur FOB doit être supérieure à 0")
    private BigDecimal valeurFob;
    
    @NotBlank(message = "Le code HS est requis")
    @Size(max = 20, message = "Le code HS ne doit pas dépasser 20 caractères")
    private String codeHs;
    
    private BigDecimal poids;
    
    @NotBlank(message = "La devise est requise")
    @Size(max = 3, message = "Le code devise ne doit pas dépasser 3 caractères")
    private String devise;
    
    private String incoterm;
    
    private BigDecimal assurance;
    
    // Constructeurs
    public ImportLandedCostDto() {}
    
    public ImportLandedCostDto(String paysOrigine, String portEmbarquement, String paysDestination, 
                              String portDechargement, BigDecimal valeurFob, String codeHs, 
                              BigDecimal poids, String devise, String incoterm, BigDecimal assurance) {
        this.paysOrigine = paysOrigine;
        this.portEmbarquement = portEmbarquement;
        this.paysDestination = paysDestination;
        this.portDechargement = portDechargement;
        this.valeurFob = valeurFob;
        this.codeHs = codeHs;
        this.poids = poids;
        this.devise = devise;
        this.incoterm = incoterm;
        this.assurance = assurance;
    }
    
    // Getters
    public String getPaysOrigine() { return paysOrigine; }
    public String getPortEmbarquement() { return portEmbarquement; }
    public String getPaysDestination() { return paysDestination; }
    public String getPortDechargement() { return portDechargement; }
    public BigDecimal getValeurFob() { return valeurFob; }
    public String getCodeHs() { return codeHs; }
    public BigDecimal getPoids() { return poids; }
    public String getDevise() { return devise; }
    public String getIncoterm() { return incoterm; }
    public BigDecimal getAssurance() { return assurance; }
    
    // Setters
    public void setPaysOrigine(String paysOrigine) { this.paysOrigine = paysOrigine; }
    public void setPortEmbarquement(String portEmbarquement) { this.portEmbarquement = portEmbarquement; }
    public void setPaysDestination(String paysDestination) { this.paysDestination = paysDestination; }
    public void setPortDechargement(String portDechargement) { this.portDechargement = portDechargement; }
    public void setValeurFob(BigDecimal valeurFob) { this.valeurFob = valeurFob; }
    public void setCodeHs(String codeHs) { this.codeHs = codeHs; }
    public void setPoids(BigDecimal poids) { this.poids = poids; }
    public void setDevise(String devise) { this.devise = devise; }
    public void setIncoterm(String incoterm) { this.incoterm = incoterm; }
    public void setAssurance(BigDecimal assurance) { this.assurance = assurance; }
}
