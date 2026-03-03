package com.smartexport.platform.service;

import com.smartexport.platform.dto.MaritimeRouteDto;
import com.smartexport.platform.entity.MaritimeRoute;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.MaritimeRouteRepository;
import com.smartexport.platform.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for integrating with maritime route APIs
 * Uses free APIs like SeaRates or World Port Index data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SeaRoutesApiService {
    
    private final MaritimeRouteRepository routeRepository;
    private final PortRepository portRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    
    // Cache duration: 30 days (routes don't change frequently)
    private static final long CACHE_DURATION_DAYS = 30;
    
    /**
     * Get or calculate maritime route between two ports
     * Uses cached data if available, otherwise calculates/fetches from API
     */
    public MaritimeRouteDto getRoute(Long originPortId, Long destPortId) {
        // Check cache first
        Optional<MaritimeRoute> cachedRoute = routeRepository.findByOriginAndDestination(originPortId, destPortId);
        
        if (cachedRoute.isPresent() && isCacheValid(cachedRoute.get())) {
            log.info("Using cached route from {} to {}", originPortId, destPortId);
            return convertToDto(cachedRoute.get());
        }
        
        // Calculate or fetch new route
        log.info("Calculating new route from port {} to port {}", originPortId, destPortId);
        MaritimeRoute route = calculateRoute(originPortId, destPortId);
        
        // Save to cache
        if (cachedRoute.isPresent()) {
            route.setId(cachedRoute.get().getId());
        }
        route = routeRepository.save(route);
        
        return convertToDto(route);
    }
    
    /**
     * Calculate route using Haversine formula for distance
     * In production, this would call SeaRates API or similar
     */
    private MaritimeRoute calculateRoute(Long originPortId, Long destPortId) {
        Port originPort = portRepository.findById(originPortId)
            .orElseThrow(() -> new RuntimeException("Origin port not found: " + originPortId));
        
        Port destPort = portRepository.findById(destPortId)
            .orElseThrow(() -> new RuntimeException("Destination port not found: " + destPortId));
        
        // Get coordinates from real ports database (frontend/src/data/realPortsDatabase.js)
        // For now, use estimated calculation based on country distance
        BigDecimal distanceNm = calculateDistanceEstimate(originPort, destPort);
        BigDecimal distanceKm = distanceNm.multiply(BigDecimal.valueOf(1.852));
        
        // Estimate transit time (average speed 20 knots)
        Integer estimatedDays = distanceNm.divide(BigDecimal.valueOf(20 * 24), 0, RoundingMode.UP).intValue();
        
        // Calculate surcharges based on route
        BigDecimal bunkerSurcharge = calculateBunkerSurcharge(distanceNm);
        BigDecimal canalFees = calculateCanalFees(originPort, destPort);
        BigDecimal securitySurcharge = calculateSecuritySurcharge(distanceNm);
        
        MaritimeRoute route = new MaritimeRoute();
        route.setOriginPort(originPort);
        route.setDestinationPort(destPort);
        route.setDistanceNm(distanceNm);
        route.setDistanceKm(distanceKm);
        route.setEstimatedDays(estimatedDays);
        route.setBunkerSurcharge(bunkerSurcharge);
        route.setCanalFees(canalFees);
        route.setSecuritySurcharge(securitySurcharge);
        route.setDataSource("CALCULATED");
        route.setLastUpdated(LocalDateTime.now());
        
        return route;
    }
    
    /**
     * Estimate distance based on country pairs
     * In production, use real coordinates and Haversine formula or API
     */
    private BigDecimal calculateDistanceEstimate(Port origin, Port dest) {
        // Simplified distance estimation based on common routes
        // In production, use actual port coordinates from realPortsDatabase.js
        
        String originCountry = origin.getPays();
        String destCountry = dest.getPays();
        
        // Common route distances in nautical miles (approximate)
        if (isTransAtlantic(originCountry, destCountry)) {
            return BigDecimal.valueOf(3500); // ~3500 NM
        } else if (isTransPacific(originCountry, destCountry)) {
            return BigDecimal.valueOf(5500); // ~5500 NM
        } else if (isEuropeAsia(originCountry, destCountry)) {
            return BigDecimal.valueOf(8000); // ~8000 NM via Suez
        } else if (isIntraEurope(originCountry, destCountry)) {
            return BigDecimal.valueOf(1500); // ~1500 NM
        } else if (isIntraAsia(originCountry, destCountry)) {
            return BigDecimal.valueOf(2000); // ~2000 NM
        } else {
            return BigDecimal.valueOf(3000); // Default estimate
        }
    }
    
    private boolean isTransAtlantic(String origin, String dest) {
        return (isEuropean(origin) && isAmerican(dest)) || (isAmerican(origin) && isEuropean(dest));
    }
    
    private boolean isTransPacific(String origin, String dest) {
        return (isAsian(origin) && isAmerican(dest)) || (isAmerican(origin) && isAsian(dest));
    }
    
    private boolean isEuropeAsia(String origin, String dest) {
        return (isEuropean(origin) && isAsian(dest)) || (isAsian(origin) && isEuropean(dest));
    }
    
    private boolean isIntraEurope(String origin, String dest) {
        return isEuropean(origin) && isEuropean(dest);
    }
    
    private boolean isIntraAsia(String origin, String dest) {
        return isAsian(origin) && isAsian(dest);
    }
    
    private boolean isEuropean(String country) {
        return country.matches(".*(France|Allemagne|Espagne|Italie|Belgique|Pays-Bas|Portugal|Royaume-Uni|Grèce|Pologne|Suède|Norvège|Danemark).*");
    }
    
    private boolean isAsian(String country) {
        return country.matches(".*(Chine|Japon|Corée|Singapour|Malaisie|Thaïlande|Vietnam|Indonésie|Philippines|Inde|Pakistan|Bangladesh).*");
    }
    
    private boolean isAmerican(String country) {
        return country.matches(".*(États-Unis|Canada|Mexique|Brésil|Argentine|Chili|Colombie|Pérou).*");
    }
    
    /**
     * Calculate bunker surcharge (fuel)
     * Typically $50-150 per container depending on distance
     */
    private BigDecimal calculateBunkerSurcharge(BigDecimal distanceNm) {
        // $0.02 per NM as base rate
        return distanceNm.multiply(BigDecimal.valueOf(0.02)).setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate canal fees (Suez, Panama)
     */
    private BigDecimal calculateCanalFees(Port origin, Port dest) {
        String originCountry = origin.getPays();
        String destCountry = dest.getPays();
        
        // Suez Canal (Europe-Asia routes)
        if (isEuropeAsia(originCountry, destCountry)) {
            return BigDecimal.valueOf(300); // ~$300 per container
        }
        
        // Panama Canal (Asia-Americas East Coast or Americas-Europe via Pacific)
        if ((isAsian(originCountry) && destCountry.contains("États-Unis")) ||
            (destCountry.contains("États-Unis") && isAsian(originCountry))) {
            return BigDecimal.valueOf(250); // ~$250 per container
        }
        
        return BigDecimal.ZERO;
    }
    
    /**
     * Calculate security surcharge
     * Typically $25-50 per container
     */
    private BigDecimal calculateSecuritySurcharge(BigDecimal distanceNm) {
        // Base $30 + $0.005 per NM
        return BigDecimal.valueOf(30).add(
            distanceNm.multiply(BigDecimal.valueOf(0.005))
        ).setScale(2, RoundingMode.HALF_UP);
    }
    
    private boolean isCacheValid(MaritimeRoute route) {
        if (route.getLastUpdated() == null) {
            return false;
        }
        LocalDateTime expiryDate = route.getLastUpdated().plusDays(CACHE_DURATION_DAYS);
        return LocalDateTime.now().isBefore(expiryDate);
    }
    
    private MaritimeRouteDto convertToDto(MaritimeRoute route) {
        return MaritimeRouteDto.builder()
            .id(route.getId())
            .originPortId(route.getOriginPort().getId())
            .originPortName(route.getOriginPort().getNomPort())
            .originCountry(route.getOriginPort().getPays())
            .destinationPortId(route.getDestinationPort().getId())
            .destinationPortName(route.getDestinationPort().getNomPort())
            .destinationCountry(route.getDestinationPort().getPays())
            .distanceNm(route.getDistanceNm())
            .distanceKm(route.getDistanceKm())
            .estimatedDays(route.getEstimatedDays())
            .bunkerSurcharge(route.getBunkerSurcharge())
            .canalFees(route.getCanalFees())
            .securitySurcharge(route.getSecuritySurcharge())
            .dataSource(route.getDataSource())
            .build();
    }
}
