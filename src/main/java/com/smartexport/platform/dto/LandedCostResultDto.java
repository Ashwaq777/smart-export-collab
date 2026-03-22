package com.smartexport.platform.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    
    // Constructors
    public LandedCostResultDto() {}
    
    public LandedCostResultDto(
        String codeHs, String nomProduit, String paysDestination,
        BigDecimal valeurFob, BigDecimal coutTransport, BigDecimal assurance, BigDecimal valeurCaf,
        BigDecimal tauxDouane, BigDecimal montantDouane, BigDecimal tauxTva, BigDecimal montantTva,
        BigDecimal taxeParafiscale, BigDecimal montantTaxeParafiscale, String nomPort, BigDecimal fraisPortuaires,
        BigDecimal coutTotal, BigDecimal coutEstime, BigDecimal varianceCout, String variancePercentage,
        String currency, BigDecimal coutTotalEur, BigDecimal coutTotalUsd, String disclaimer, String exchangeRateSource,
        LocalDateTime calculationDate, String nomEntreprise, String registreCommerce, String ice,
        String simulationId, BigDecimal prixVentePrevisionnel, BigDecimal margeNette, BigDecimal margePourcentage,
        String indicateurRentabilite, Boolean alerteSiv, String messageSiv, BigDecimal prixEntreeSivMin,
        BigDecimal impactDevise2PourcentPlus, BigDecimal impactDevise2PourcentMoins, BigDecimal poidsNet,
        BigDecimal poidsBrut, String typeUnite, String incoterm, String dataSource, String warningMessage,
        MaritimeTransportCostDto maritimeTransport) {
        
        this.codeHs = codeHs;
        this.nomProduit = nomProduit;
        this.paysDestination = paysDestination;
        this.valeurFob = valeurFob;
        this.coutTransport = coutTransport;
        this.assurance = assurance;
        this.valeurCaf = valeurCaf;
        this.tauxDouane = tauxDouane;
        this.montantDouane = montantDouane;
        this.tauxTva = tauxTva;
        this.montantTva = montantTva;
        this.taxeParafiscale = taxeParafiscale;
        this.montantTaxeParafiscale = montantTaxeParafiscale;
        this.nomPort = nomPort;
        this.fraisPortuaires = fraisPortuaires;
        this.coutTotal = coutTotal;
        this.coutEstime = coutEstime;
        this.varianceCout = varianceCout;
        this.variancePercentage = variancePercentage;
        this.currency = currency;
        this.coutTotalEur = coutTotalEur;
        this.coutTotalUsd = coutTotalUsd;
        this.disclaimer = disclaimer;
        this.exchangeRateSource = exchangeRateSource;
        this.calculationDate = calculationDate;
        this.nomEntreprise = nomEntreprise;
        this.registreCommerce = registreCommerce;
        this.ice = ice;
        this.simulationId = simulationId;
        this.prixVentePrevisionnel = prixVentePrevisionnel;
        this.margeNette = margeNette;
        this.margePourcentage = margePourcentage;
        this.indicateurRentabilite = indicateurRentabilite;
        this.alerteSiv = alerteSiv;
        this.messageSiv = messageSiv;
        this.prixEntreeSivMin = prixEntreeSivMin;
        this.impactDevise2PourcentPlus = impactDevise2PourcentPlus;
        this.impactDevise2PourcentMoins = impactDevise2PourcentMoins;
        this.poidsNet = poidsNet;
        this.poidsBrut = poidsBrut;
        this.typeUnite = typeUnite;
        this.incoterm = incoterm;
        this.dataSource = dataSource;
        this.warningMessage = warningMessage;
        this.maritimeTransport = maritimeTransport;
    }
    
    // Getters and Setters
    public String getCodeHs() { return codeHs; }
    public void setCodeHs(String codeHs) { this.codeHs = codeHs; }
    
    public String getNomProduit() { return nomProduit; }
    public void setNomProduit(String nomProduit) { this.nomProduit = nomProduit; }
    
    public String getPaysDestination() { return paysDestination; }
    public void setPaysDestination(String paysDestination) { this.paysDestination = paysDestination; }
    
    public BigDecimal getValeurFob() { return valeurFob; }
    public void setValeurFob(BigDecimal valeurFob) { this.valeurFob = valeurFob; }
    
    public BigDecimal getCoutTransport() { return coutTransport; }
    public void setCoutTransport(BigDecimal coutTransport) { this.coutTransport = coutTransport; }
    
    public BigDecimal getAssurance() { return assurance; }
    public void setAssurance(BigDecimal assurance) { this.assurance = assurance; }
    
    public BigDecimal getValeurCaf() { return valeurCaf; }
    public void setValeurCaf(BigDecimal valeurCaf) { this.valeurCaf = valeurCaf; }
    
    public BigDecimal getTauxDouane() { return tauxDouane; }
    public void setTauxDouane(BigDecimal tauxDouane) { this.tauxDouane = tauxDouane; }
    
    public BigDecimal getMontantDouane() { return montantDouane; }
    public void setMontantDouane(BigDecimal montantDouane) { this.montantDouane = montantDouane; }
    
    public BigDecimal getTauxTva() { return tauxTva; }
    public void setTauxTva(BigDecimal tauxTva) { this.tauxTva = tauxTva; }
    
    public BigDecimal getMontantTva() { return montantTva; }
    public void setMontantTva(BigDecimal montantTva) { this.montantTva = montantTva; }
    
    public BigDecimal getTaxeParafiscale() { return taxeParafiscale; }
    public void setTaxeParafiscale(BigDecimal taxeParafiscale) { this.taxeParafiscale = taxeParafiscale; }
    
    public BigDecimal getMontantTaxeParafiscale() { return montantTaxeParafiscale; }
    public void setMontantTaxeParafiscale(BigDecimal montantTaxeParafiscale) { this.montantTaxeParafiscale = montantTaxeParafiscale; }
    
    public String getNomPort() { return nomPort; }
    public void setNomPort(String nomPort) { this.nomPort = nomPort; }
    
    public BigDecimal getFraisPortuaires() { return fraisPortuaires; }
    public void setFraisPortuaires(BigDecimal fraisPortuaires) { this.fraisPortuaires = fraisPortuaires; }
    
    public BigDecimal getCoutTotal() { return coutTotal; }
    public void setCoutTotal(BigDecimal coutTotal) { this.coutTotal = coutTotal; }
    
    public BigDecimal getCoutEstime() { return coutEstime; }
    public void setCoutEstime(BigDecimal coutEstime) { this.coutEstime = coutEstime; }
    
    public BigDecimal getVarianceCout() { return varianceCout; }
    public void setVarianceCout(BigDecimal varianceCout) { this.varianceCout = varianceCout; }
    
    public String getVariancePercentage() { return variancePercentage; }
    public void setVariancePercentage(String variancePercentage) { this.variancePercentage = variancePercentage; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public BigDecimal getCoutTotalEur() { return coutTotalEur; }
    public void setCoutTotalEur(BigDecimal coutTotalEur) { this.coutTotalEur = coutTotalEur; }
    
    public BigDecimal getCoutTotalUsd() { return coutTotalUsd; }
    public void setCoutTotalUsd(BigDecimal coutTotalUsd) { this.coutTotalUsd = coutTotalUsd; }
    
    public String getDisclaimer() { return disclaimer; }
    public void setDisclaimer(String disclaimer) { this.disclaimer = disclaimer; }
    
    public String getExchangeRateSource() { return exchangeRateSource; }
    public void setExchangeRateSource(String exchangeRateSource) { this.exchangeRateSource = exchangeRateSource; }
    
    public LocalDateTime getCalculationDate() { return calculationDate; }
    public void setCalculationDate(LocalDateTime calculationDate) { this.calculationDate = calculationDate; }
    
    public String getNomEntreprise() { return nomEntreprise; }
    public void setNomEntreprise(String nomEntreprise) { this.nomEntreprise = nomEntreprise; }
    
    public String getRegistreCommerce() { return registreCommerce; }
    public void setRegistreCommerce(String registreCommerce) { this.registreCommerce = registreCommerce; }
    
    public String getIce() { return ice; }
    public void setIce(String ice) { this.ice = ice; }
    
    public String getSimulationId() { return simulationId; }
    public void setSimulationId(String simulationId) { this.simulationId = simulationId; }
    
    public BigDecimal getPrixVentePrevisionnel() { return prixVentePrevisionnel; }
    public void setPrixVentePrevisionnel(BigDecimal prixVentePrevisionnel) { this.prixVentePrevisionnel = prixVentePrevisionnel; }
    
    public BigDecimal getMargeNette() { return margeNette; }
    public void setMargeNette(BigDecimal margeNette) { this.margeNette = margeNette; }
    
    public BigDecimal getMargePourcentage() { return margePourcentage; }
    public void setMargePourcentage(BigDecimal margePourcentage) { this.margePourcentage = margePourcentage; }
    
    public String getIndicateurRentabilite() { return indicateurRentabilite; }
    public void setIndicateurRentabilite(String indicateurRentabilite) { this.indicateurRentabilite = indicateurRentabilite; }
    
    public Boolean getAlerteSiv() { return alerteSiv; }
    public void setAlerteSiv(Boolean alerteSiv) { this.alerteSiv = alerteSiv; }
    
    public String getMessageSiv() { return messageSiv; }
    public void setMessageSiv(String messageSiv) { this.messageSiv = messageSiv; }
    
    public BigDecimal getPrixEntreeSivMin() { return prixEntreeSivMin; }
    public void setPrixEntreeSivMin(BigDecimal prixEntreeSivMin) { this.prixEntreeSivMin = prixEntreeSivMin; }
    
    public BigDecimal getImpactDevise2PourcentPlus() { return impactDevise2PourcentPlus; }
    public void setImpactDevise2PourcentPlus(BigDecimal impactDevise2PourcentPlus) { this.impactDevise2PourcentPlus = impactDevise2PourcentPlus; }
    
    public BigDecimal getImpactDevise2PourcentMoins() { return impactDevise2PourcentMoins; }
    public void setImpactDevise2PourcentMoins(BigDecimal impactDevise2PourcentMoins) { this.impactDevise2PourcentMoins = impactDevise2PourcentMoins; }
    
    public BigDecimal getPoidsNet() { return poidsNet; }
    public void setPoidsNet(BigDecimal poidsNet) { this.poidsNet = poidsNet; }
    
    public BigDecimal getPoidsBrut() { return poidsBrut; }
    public void setPoidsBrut(BigDecimal poidsBrut) { this.poidsBrut = poidsBrut; }
    
    public String getTypeUnite() { return typeUnite; }
    public void setTypeUnite(String typeUnite) { this.typeUnite = typeUnite; }
    
    public String getIncoterm() { return incoterm; }
    public void setIncoterm(String incoterm) { this.incoterm = incoterm; }
    
    public String getDataSource() { return dataSource; }
    public void setDataSource(String dataSource) { this.dataSource = dataSource; }
    
    public String getWarningMessage() { return warningMessage; }
    public void setWarningMessage(String warningMessage) { this.warningMessage = warningMessage; }
    
    public MaritimeTransportCostDto getMaritimeTransport() { return maritimeTransport; }
    public void setMaritimeTransport(MaritimeTransportCostDto maritimeTransport) { this.maritimeTransport = maritimeTransport; }
    
    // Builder pattern (simplified)
    public static Builder builder() {
        return new Builder();
    }
    
    public static class Builder {
        private LandedCostResultDto dto = new LandedCostResultDto();
        
        public Builder codeHs(String codeHs) { dto.setCodeHs(codeHs); return this; }
        public Builder nomProduit(String nomProduit) { dto.setNomProduit(nomProduit); return this; }
        public Builder paysDestination(String paysDestination) { dto.setPaysDestination(paysDestination); return this; }
        public Builder valeurFob(BigDecimal valeurFob) { dto.setValeurFob(valeurFob); return this; }
        public Builder coutTransport(BigDecimal coutTransport) { dto.setCoutTransport(coutTransport); return this; }
        public Builder assurance(BigDecimal assurance) { dto.setAssurance(assurance); return this; }
        public Builder valeurCaf(BigDecimal valeurCaf) { dto.setValeurCaf(valeurCaf); return this; }
        public Builder tauxDouane(BigDecimal tauxDouane) { dto.setTauxDouane(tauxDouane); return this; }
        public Builder montantDouane(BigDecimal montantDouane) { dto.setMontantDouane(montantDouane); return this; }
        public Builder tauxTva(BigDecimal tauxTva) { dto.setTauxTva(tauxTva); return this; }
        public Builder montantTva(BigDecimal montantTva) { dto.setMontantTva(montantTva); return this; }
        public Builder taxeParafiscale(BigDecimal taxeParafiscale) { dto.setTaxeParafiscale(taxeParafiscale); return this; }
        public Builder montantTaxeParafiscale(BigDecimal montantTaxeParafiscale) { dto.setMontantTaxeParafiscale(montantTaxeParafiscale); return this; }
        public Builder nomPort(String nomPort) { dto.setNomPort(nomPort); return this; }
        public Builder fraisPortuaires(BigDecimal fraisPortuaires) { dto.setFraisPortuaires(fraisPortuaires); return this; }
        public Builder coutTotal(BigDecimal coutTotal) { dto.setCoutTotal(coutTotal); return this; }
        public Builder coutEstime(BigDecimal coutEstime) { dto.setCoutEstime(coutEstime); return this; }
        public Builder varianceCout(BigDecimal varianceCout) { dto.setVarianceCout(varianceCout); return this; }
        public Builder variancePercentage(String variancePercentage) { dto.setVariancePercentage(variancePercentage); return this; }
        public Builder currency(String currency) { dto.setCurrency(currency); return this; }
        public Builder coutTotalEur(BigDecimal coutTotalEur) { dto.setCoutTotalEur(coutTotalEur); return this; }
        public Builder coutTotalUsd(BigDecimal coutTotalUsd) { dto.setCoutTotalUsd(coutTotalUsd); return this; }
        public Builder disclaimer(String disclaimer) { dto.setDisclaimer(disclaimer); return this; }
        public Builder exchangeRateSource(String exchangeRateSource) { dto.setExchangeRateSource(exchangeRateSource); return this; }
        public Builder calculationDate(LocalDateTime calculationDate) { dto.setCalculationDate(calculationDate); return this; }
        public Builder nomEntreprise(String nomEntreprise) { dto.setNomEntreprise(nomEntreprise); return this; }
        public Builder registreCommerce(String registreCommerce) { dto.setRegistreCommerce(registreCommerce); return this; }
        public Builder ice(String ice) { dto.setIce(ice); return this; }
        public Builder simulationId(String simulationId) { dto.setSimulationId(simulationId); return this; }
        public Builder prixVentePrevisionnel(BigDecimal prixVentePrevisionnel) { dto.setPrixVentePrevisionnel(prixVentePrevisionnel); return this; }
        public Builder margeNette(BigDecimal margeNette) { dto.setMargeNette(margeNette); return this; }
        public Builder margePourcentage(BigDecimal margePourcentage) { dto.setMargePourcentage(margePourcentage); return this; }
        public Builder indicateurRentabilite(String indicateurRentabilite) { dto.setIndicateurRentabilite(indicateurRentabilite); return this; }
        public Builder alerteSiv(Boolean alerteSiv) { dto.setAlerteSiv(alerteSiv); return this; }
        public Builder messageSiv(String messageSiv) { dto.setMessageSiv(messageSiv); return this; }
        public Builder prixEntreeSivMin(BigDecimal prixEntreeSivMin) { dto.setPrixEntreeSivMin(prixEntreeSivMin); return this; }
        public Builder impactDevise2PourcentPlus(BigDecimal impactDevise2PourcentPlus) { dto.setImpactDevise2PourcentPlus(impactDevise2PourcentPlus); return this; }
        public Builder impactDevise2PourcentMoins(BigDecimal impactDevise2PourcentMoins) { dto.setImpactDevise2PourcentMoins(impactDevise2PourcentMoins); return this; }
        public Builder poidsNet(BigDecimal poidsNet) { dto.setPoidsNet(poidsNet); return this; }
        public Builder poidsBrut(BigDecimal poidsBrut) { dto.setPoidsBrut(poidsBrut); return this; }
        public Builder typeUnite(String typeUnite) { dto.setTypeUnite(typeUnite); return this; }
        public Builder incoterm(String incoterm) { dto.setIncoterm(incoterm); return this; }
        public Builder dataSource(String dataSource) { dto.setDataSource(dataSource); return this; }
        public Builder warningMessage(String warningMessage) { dto.setWarningMessage(warningMessage); return this; }
        public Builder maritimeTransport(MaritimeTransportCostDto maritimeTransport) { dto.setMaritimeTransport(maritimeTransport); return this; }
        
        public LandedCostResultDto build() {
            return dto;
        }
    }
}
