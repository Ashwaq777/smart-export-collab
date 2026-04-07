package com.smartexport.platform.carbon.dto;

public class CarbonRequestDTO {
    private String origin;
    private String destination;
    private Double weightTon;
    private String transportMode;
    
    // Optional coordinate fields for direct distance calculation
    private Double originLat;
    private Double originLng;
    private Double destLat;
    private Double destLng;

    public CarbonRequestDTO() {}

    public String getOrigin() { return origin; }
    public String getDestination() { return destination; }
    public Double getWeightTon() { return weightTon; }
    public String getTransportMode() { return transportMode; }
    public Double getOriginLat() { return originLat; }
    public Double getOriginLng() { return originLng; }
    public Double getDestLat() { return destLat; }
    public Double getDestLng() { return destLng; }

    public void setOrigin(String origin) { this.origin = origin; }
    public void setDestination(String destination) { this.destination = destination; }
    public void setWeightTon(Double weightTon) { this.weightTon = weightTon; }
    public void setTransportMode(String transportMode) { this.transportMode = transportMode; }
    public void setOriginLat(Double originLat) { this.originLat = originLat; }
    public void setOriginLng(Double originLng) { this.originLng = originLng; }
    public void setDestLat(Double destLat) { this.destLat = destLat; }
    public void setDestLng(Double destLng) { this.destLng = destLng; }
}
