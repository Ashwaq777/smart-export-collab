package com.smartexport.platform.carbon.dto;

public class CarbonResponseDTO {
    private Double co2Kg;
    private Double co2Tonnes;
    private Double cbamTaxEur;
    private Double distanceKm;
    private String equation;
    private String formulaDisplay;

    public CarbonResponseDTO() {}

    public Double getCo2Kg() { return co2Kg; }
    public Double getCo2Tonnes() { return co2Tonnes; }
    public Double getCbamTaxEur() { return cbamTaxEur; }
    public Double getDistanceKm() { return distanceKm; }
    public String getEquation() { return equation; }
    public String getFormulaDisplay() { return formulaDisplay; }

    public void setCo2Kg(Double co2Kg) { this.co2Kg = co2Kg; }
    public void setCo2Tonnes(Double co2Tonnes) { this.co2Tonnes = co2Tonnes; }
    public void setCbamTaxEur(Double cbamTaxEur) { this.cbamTaxEur = cbamTaxEur; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public void setEquation(String equation) { this.equation = equation; }
    public void setFormulaDisplay(String formulaDisplay) { this.formulaDisplay = formulaDisplay; }
}
