package com.smartexport.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
public class DatalasticSeaRoutesService {
    
    private static final Logger logger = LoggerFactory.getLogger(DatalasticSeaRoutesService.class);
    
    @Value("${datalastic.api.key:demo}")
    private String apiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public DatalasticSeaRoutesService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Cacheable(value = "seaRoutesV3", key = "#originUnlocode + '-' + #destUnlocode")
    public SeaRouteResult calculateDistance(String originUnlocode, String destUnlocode) {
        if (apiKey == null || apiKey.trim().isEmpty() || "demo".equalsIgnoreCase(apiKey.trim())) {
            logger.info(
                "Datalastic API key not configured. Skipping API call for route {} -> {} and using fallback estimate.",
                originUnlocode,
                destUnlocode
            );
            return calculateFallbackDistance(originUnlocode, destUnlocode);
        }

        try {
            String url = String.format(
                "https://api.datalastic.com/api/sandbox/route?api-key=%s&port_unlocode_from=%s&port_unlocode_to=%s",
                apiKey, originUnlocode, destUnlocode
            );
            
            logger.info("Calling Datalastic API for route: {} -> {}", originUnlocode, destUnlocode);
            
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if (root.has("distance")) {
                double distanceNm = root.get("distance").asDouble();

                // Datalastic sandbox can return very small numbers for invalid UN/LOCODE pairs.
                // Consider those values suspicious and fallback to our estimate.
                if (distanceNm < 50.0) {
                    logger.warn(
                        "Suspicious distance {} NM from API for route {} -> {}. Falling back to estimate.",
                        distanceNm,
                        originUnlocode,
                        destUnlocode
                    );
                    return calculateFallbackDistance(originUnlocode, destUnlocode);
                }
                int estimatedDays = (int) Math.ceil(distanceNm / (24 * 15)); // 15 knots average speed
                
                return new SeaRouteResult(
                    BigDecimal.valueOf(distanceNm),
                    BigDecimal.valueOf(distanceNm * 1.852), // NM to KM
                    estimatedDays,
                    "DATALASTIC_API"
                );
            }
            
            logger.warn("No distance found in API response, using fallback calculation");
            return calculateFallbackDistance(originUnlocode, destUnlocode);
            
        } catch (Exception e) {
            logger.error("Error calling Datalastic API: {}", e.getMessage());
            return calculateFallbackDistance(originUnlocode, destUnlocode);
        }
    }
    
    private SeaRouteResult calculateFallbackDistance(String originUnlocode, String destUnlocode) {
        // Fallback: estimated average distances based on region pairs
        double estimatedNm = 3000.0; // Default

        String originRegion = "XX";
        String destRegion = "XX";
        if (originUnlocode != null && originUnlocode.length() >= 2) {
            originRegion = originUnlocode.substring(0, 2);
        }
        if (destUnlocode != null && destUnlocode.length() >= 2) {
            destRegion = destUnlocode.substring(0, 2);
        }
        
        // Simple region-based estimation
        if (originRegion.equals(destRegion)) {
            estimatedNm = 500.0; // Same region
        } else if (isEurope(originRegion) && isEurope(destRegion)) {
            estimatedNm = 1500.0;
        } else if (isAsia(originRegion) && isAsia(destRegion)) {
            estimatedNm = 2000.0;
        } else if ((isEurope(originRegion) && isAsia(destRegion)) || (isAsia(originRegion) && isEurope(destRegion))) {
            estimatedNm = 8000.0;
        } else if ((isEurope(originRegion) && isAmericas(destRegion)) || (isAmericas(originRegion) && isEurope(destRegion))) {
            estimatedNm = 3500.0;
        } else if ((isAsia(originRegion) && isAmericas(destRegion)) || (isAmericas(originRegion) && isAsia(destRegion))) {
            estimatedNm = 6500.0;
        }

        // Safety guard: never return implausibly small distances in fallback mode
        if (estimatedNm < 100.0) {
            estimatedNm = 3000.0;
        }
        
        int estimatedDays = (int) Math.ceil(estimatedNm / (24 * 15));
        
        return new SeaRouteResult(
            BigDecimal.valueOf(estimatedNm),
            BigDecimal.valueOf(estimatedNm * 1.852),
            estimatedDays,
            "ESTIMATED"
        );
    }
    
    private boolean isEurope(String countryCode) {
        return countryCode.matches("FR|DE|NL|BE|ES|IT|GB|GR|PT|PL|DK|SE|NO|FI|IE");
    }
    
    private boolean isAsia(String countryCode) {
        return countryCode.matches("CN|SG|JP|KR|IN|TH|MY|ID|VN|PH|AE|SA|IL|TR");
    }
    
    private boolean isAmericas(String countryCode) {
        return countryCode.matches("US|CA|MX|BR|AR|CL|CO|PE");
    }
    
    public static class SeaRouteResult {
        private final BigDecimal distanceNm;
        private final BigDecimal distanceKm;
        private final int estimatedDays;
        private final String dataSource;
        
        public SeaRouteResult(BigDecimal distanceNm, BigDecimal distanceKm, int estimatedDays, String dataSource) {
            this.distanceNm = distanceNm;
            this.distanceKm = distanceKm;
            this.estimatedDays = estimatedDays;
            this.dataSource = dataSource;
        }
        
        public BigDecimal getDistanceNm() { return distanceNm; }
        public BigDecimal getDistanceKm() { return distanceKm; }
        public int getEstimatedDays() { return estimatedDays; }
        public String getDataSource() { return dataSource; }
    }
}
