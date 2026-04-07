package com.smartexport.platform.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
public class ExchangeRateResponse {
    
    private String result;
    
    @JsonProperty("base_code")
    private String baseCode;
    
    @JsonProperty("conversion_rates")
    private Map<String, BigDecimal> conversionRates;
    
    @JsonProperty("time_last_update_unix")
    private Long timeLastUpdateUnix;
}
