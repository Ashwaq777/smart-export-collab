package com.smartexport.platform.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

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
    
    // Maritime transport (optional)
    private String vesselMmsi;
    private String vesselName;
    private Long portOriginId;
    private BigDecimal weightTonnes;
    
    // Constructors
    public LandedCostCalculationDto() {}
    
    public LandedCostCalculationDto(
        String codeHs, String paysDestination, BigDecimal valeurFob, BigDecimal coutTransport,
        BigDecimal assurance, String currency, Long portId, String nomEntreprise, String registreCommerce,
        String ice, String incoterm, BigDecimal prixVentePrevisionnel, BigDecimal poidsNet,
        BigDecimal poidsBrut, String typeUnite, String vesselMmsi, String vesselName,
        Long portOriginId, BigDecimal weightTonnes) {
        
        this.codeHs = codeHs;
        this.paysDestination = paysDestination;
        this.valeurFob = valeurFob;
        this.coutTransport = coutTransport;
        this.assurance = assurance;
        this.currency = currency;
        this.portId = portId;
        this.nomEntreprise = nomEntreprise;
        this.registreCommerce = registreCommerce;
        this.ice = ice;
        this.incoterm = incoterm;
        this.prixVentePrevisionnel = prixVentePrevisionnel;
        this.poidsNet = poidsNet;
        this.poidsBrut = poidsBrut;
        this.typeUnite = typeUnite;
        this.vesselMmsi = vesselMmsi;
        this.vesselName = vesselName;
        this.portOriginId = portOriginId;
        this.weightTonnes = weightTonnes;
    }
    
    // Getters and Setters
    public String getCodeHs() { return codeHs; }
    public void setCodeHs(String codeHs) { this.codeHs = codeHs; }
    
    public String getPaysDestination() { return paysDestination; }
    public void setPaysDestination(String paysDestination) { this.paysDestination = paysDestination; }
    
    public BigDecimal getValeurFob() { return valeurFob; }
    public void setValeurFob(BigDecimal valeurFob) { this.valeurFob = valeurFob; }
    
    public BigDecimal getCoutTransport() { return coutTransport; }
    public void setCoutTransport(BigDecimal coutTransport) { this.coutTransport = coutTransport; }
    
    public BigDecimal getAssurance() { return assurance; }
    public void setAssurance(BigDecimal assurance) { this.assurance = assurance; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Long getPortId() { return portId; }
    public void setPortId(Long portId) { this.portId = portId; }
    
    public String getNomEntreprise() { return nomEntreprise; }
    public void setNomEntreprise(String nomEntreprise) { this.nomEntreprise = nomEntreprise; }
    
    public String getRegistreCommerce() { return registreCommerce; }
    public void setRegistreCommerce(String registreCommerce) { this.registreCommerce = registreCommerce; }
    
    public String getIce() { return ice; }
    public void setIce(String ice) { this.ice = ice; }
    
    public String getIncoterm() { return incoterm; }
    public void setIncoterm(String incoterm) { this.incoterm = incoterm; }
    
    public BigDecimal getPrixVentePrevisionnel() { return prixVentePrevisionnel; }
    public void setPrixVentePrevisionnel(BigDecimal prixVentePrevisionnel) { this.prixVentePrevisionnel = prixVentePrevisionnel; }
    
    public BigDecimal getPoidsNet() { return poidsNet; }
    public void setPoidsNet(BigDecimal poidsNet) { this.poidsNet = poidsNet; }
    
    public BigDecimal getPoidsBrut() { return poidsBrut; }
    public void setPoidsBrut(BigDecimal poidsBrut) { this.poidsBrut = poidsBrut; }
    
    public String getTypeUnite() { return typeUnite; }
    public void setTypeUnite(String typeUnite) { this.typeUnite = typeUnite; }
    
    public String getVesselMmsi() { return vesselMmsi; }
    public void setVesselMmsi(String vesselMmsi) { this.vesselMmsi = vesselMmsi; }
    
    public String getVesselName() { return vesselName; }
    public void setVesselName(String vesselName) { this.vesselName = vesselName; }
    
    public Long getPortOriginId() { return portOriginId; }
    public void setPortOriginId(Long portOriginId) { this.portOriginId = portOriginId; }
    
    public BigDecimal getWeightTonnes() { return weightTonnes; }
    public void setWeightTonnes(BigDecimal weightTonnes) { this.weightTonnes = weightTonnes; }
}
