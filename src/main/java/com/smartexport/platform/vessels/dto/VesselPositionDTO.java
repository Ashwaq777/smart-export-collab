package com.smartexport.platform.vessels.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class VesselPositionDTO {
    private String imo;
    private String vesselName;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private Double heading;
    private String destination;
    private String status;
    private Double distanceToDestinationKm;
    private String lastUpdate;
}
