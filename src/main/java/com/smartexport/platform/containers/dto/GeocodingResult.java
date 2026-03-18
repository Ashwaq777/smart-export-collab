package com.smartexport.platform.containers.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GeocodingResult {
    private double latitude;
    private double longitude;
    private String displayName;
}
