package com.smartexport.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ImportLandedCostResultDto {
    
    private BigDecimal valeurFob;
    private BigDecimal fretMaritime;
    private BigDecimal assurance;
    private BigDecimal valeurCif;
    private BigDecimal droitsDouaneImport;
    private BigDecimal tvaImport;
    private BigDecimal fraisPortuairesDestination;
    private BigDecimal autresFrais;
    private BigDecimal totalLandedCost;
    private String devise;
    private String reference;
    private LocalDateTime dateCalcul;
    
    // Constructeurs
    public ImportLandedCostResultDto() {}
    
    public ImportLandedCostResultDto(BigDecimal valeurFob, BigDecimal fretMaritime, BigDecimal assurance, 
                                    BigDecimal valeurCif, BigDecimal droitsDouaneImport, BigDecimal tvaImport, 
                                    BigDecimal fraisPortuairesDestination, BigDecimal autresFrais, 
                                    BigDecimal totalLandedCost, String devise, String reference, 
                                    LocalDateTime dateCalcul) {
        this.valeurFob = valeurFob;
        this.fretMaritime = fretMaritime;
        this.assurance = assurance;
        this.valeurCif = valeurCif;
        this.droitsDouaneImport = droitsDouaneImport;
        this.tvaImport = tvaImport;
        this.fraisPortuairesDestination = fraisPortuairesDestination;
        this.autresFrais = autresFrais;
        this.totalLandedCost = totalLandedCost;
        this.devise = devise;
        this.reference = reference;
        this.dateCalcul = dateCalcul;
    }
    
    // Getters
    public BigDecimal getValeurFob() { return valeurFob; }
    public BigDecimal getFretMaritime() { return fretMaritime; }
    public BigDecimal getAssurance() { return assurance; }
    public BigDecimal getValeurCif() { return valeurCif; }
    public BigDecimal getDroitsDouaneImport() { return droitsDouaneImport; }
    public BigDecimal getTvaImport() { return tvaImport; }
    public BigDecimal getFraisPortuairesDestination() { return fraisPortuairesDestination; }
    public BigDecimal getAutresFrais() { return autresFrais; }
    public BigDecimal getTotalLandedCost() { return totalLandedCost; }
    public String getDevise() { return devise; }
    public String getReference() { return reference; }
    public LocalDateTime getDateCalcul() { return dateCalcul; }
    
    // Setters
    public void setValeurFob(BigDecimal valeurFob) { this.valeurFob = valeurFob; }
    public void setFretMaritime(BigDecimal fretMaritime) { this.fretMaritime = fretMaritime; }
    public void setAssurance(BigDecimal assurance) { this.assurance = assurance; }
    public void setValeurCif(BigDecimal valeurCif) { this.valeurCif = valeurCif; }
    public void setDroitsDouaneImport(BigDecimal droitsDouaneImport) { this.droitsDouaneImport = droitsDouaneImport; }
    public void setTvaImport(BigDecimal tvaImport) { this.tvaImport = tvaImport; }
    public void setFraisPortuairesDestination(BigDecimal fraisPortuairesDestination) { this.fraisPortuairesDestination = fraisPortuairesDestination; }
    public void setAutresFrais(BigDecimal autresFrais) { this.autresFrais = autresFrais; }
    public void setTotalLandedCost(BigDecimal totalLandedCost) { this.totalLandedCost = totalLandedCost; }
    public void setDevise(String devise) { this.devise = devise; }
    public void setReference(String reference) { this.reference = reference; }
    public void setDateCalcul(LocalDateTime dateCalcul) { this.dateCalcul = dateCalcul; }
}
