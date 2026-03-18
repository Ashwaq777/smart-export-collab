package com.smartexport.platform.containers.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PortDTO {
    private String name;
    private String displayName;
    private double latitude;
    private double longitude;
    private String country;
    private String countryCode;
    private String type; // port, harbour, terminal
}
