package com.smartexport.platform.service;

import com.smartexport.platform.dto.MaritimeTransportCostDto;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaritimeTransportService {
    
    private final PortRepository portRepository;
    private final DatalasticSeaRoutesService seaRoutesService;
    private final VesselAisService vesselAisService;

    public DatalasticSeaRoutesService.SeaRouteResult getSeaRouteDistance(Long originPortId, Long destPortId) {
        Port originPort = portRepository.findById(originPortId)
            .orElseThrow(() -> new RuntimeException("Origin port not found: " + originPortId));
        Port destPort = portRepository.findById(destPortId)
            .orElseThrow(() -> new RuntimeException("Destination port not found: " + destPortId));

        return seaRoutesService.calculateDistance(
            getPortUnlocode(originPort),
            getPortUnlocode(destPort)
        );
    }

    public BigDecimal estimateUnitRateUsdPerTonnePer1000Nm(
            Long originPortId,
            Long destinationPortId,
            String containerType,
            String cargoCategory,
            String incoterm
    ) {
        DatalasticSeaRoutesService.SeaRouteResult route = getSeaRouteDistance(originPortId, destinationPortId);
        BigDecimal distanceNm = route.getDistanceNm() == null ? BigDecimal.ZERO : route.getDistanceNm();

        BigDecimal base = BigDecimal.valueOf(20.0);

        if (cargoCategory != null) {
            String cat = cargoCategory.toLowerCase();
            if (cat.contains("reefer") || cat.contains("refrig")) {
                base = base.add(BigDecimal.valueOf(4.0));
            } else if (cat.contains("agri") || cat.contains("agro")) {
                base = base.subtract(BigDecimal.valueOf(2.0));
            }
        }

        if (containerType != null) {
            String ct = containerType.trim();
            if (ct.equals("40") || ct.contains("40")) {
                base = base.multiply(BigDecimal.valueOf(1.10));
            }
        }

        if (incoterm != null) {
            String it = incoterm.trim().toUpperCase();
            if (it.equals("FOB")) {
                base = base.multiply(BigDecimal.valueOf(0.90));
            } else if (it.equals("CFR")) {
                base = base.multiply(BigDecimal.valueOf(0.97));
            }
        }

        if (distanceNm.compareTo(BigDecimal.valueOf(8000)) >= 0) {
            base = base.add(BigDecimal.valueOf(2.0));
        } else if (distanceNm.compareTo(BigDecimal.valueOf(1500)) <= 0 && distanceNm.compareTo(BigDecimal.ZERO) > 0) {
            base = base.subtract(BigDecimal.valueOf(1.0));
        }

        if (base.compareTo(BigDecimal.valueOf(12.0)) < 0) base = BigDecimal.valueOf(12.0);
        if (base.compareTo(BigDecimal.valueOf(35.0)) > 0) base = BigDecimal.valueOf(35.0);

        return base.setScale(2, RoundingMode.HALF_UP);
    }
    
    /**
     * Get available vessels for a port using real-time AIS data
     */
    public List<VesselAisService.VesselInfo> getAvailableVessels(Long portId) {
        log.info("Getting available vessels for port {}", portId);
        
        try {
            Port port = portRepository.findById(portId)
                .orElseThrow(() -> new RuntimeException("Port not found: " + portId));
            
            // Check if port has coordinates
            if (port.getLatitude() == null || port.getLongitude() == null) {
                log.warn("Port {} has no coordinates, returning empty vessel list", portId);
                return new ArrayList<>();
            }
            
            // Get real vessels from AIS API using port coordinates
            return vesselAisService.getVesselsByPort(
                port.getLatitude().doubleValue(),
                port.getLongitude().doubleValue(),
                port.getNomPort()
            );
        } catch (Exception e) {
            log.error("Error getting vessels for port {}: {}", portId, e.getMessage());
            return new ArrayList<>();
        }
    }
    
    /**
     * Calculate complete maritime transport cost with weight-based formula
     * Formula: (distance × weight × unit_rate) + fixed_fees
     */
    public MaritimeTransportCostDto calculateTransportCost(
            String vesselMmsi,
            String vesselName,
            Long originPortId,
            Long destPortId,
            BigDecimal weightTonnes,
            String containerType,
            String incoterm,
            BigDecimal fobValue
    ) {
        log.info("Calculating maritime transport cost for vessel {}, route {}->{}, weight {} tonnes",
            vesselName, originPortId, destPortId, weightTonnes);
        
        // Get port details
        Port originPort = portRepository.findById(originPortId)
            .orElseThrow(() -> new RuntimeException("Origin port not found: " + originPortId));
        Port destPort = portRepository.findById(destPortId)
            .orElseThrow(() -> new RuntimeException("Destination port not found: " + destPortId));
        
        // Get route distance from Datalastic API
        DatalasticSeaRoutesService.SeaRouteResult route = seaRoutesService.calculateDistance(
            getPortUnlocode(originPort),
            getPortUnlocode(destPort)
        );
        
        // Calculate freight cost using dynamic formula
        // Unit rate: $15-25 per tonne per 1000 NM (industry average)
        BigDecimal unitRatePerTonnePer1000Nm = BigDecimal.valueOf(20.0);
        BigDecimal distanceNm = route.getDistanceNm();
        
        BigDecimal freightCost = distanceNm
            .multiply(weightTonnes)
            .multiply(unitRatePerTonnePer1000Nm)
            .divide(BigDecimal.valueOf(1000), 2, RoundingMode.HALF_UP);
        
        // Fixed fees (handling, documentation)
        BigDecimal fixedFees = BigDecimal.valueOf(500);
        
        // Port fees (origin + destination)
        BigDecimal originPortFees = calculatePortFees(originPort, weightTonnes);
        BigDecimal destPortFees = calculatePortFees(destPort, weightTonnes);
        
        // Bunker surcharge (fuel) - ~10% of freight
        BigDecimal bunkerSurcharge = freightCost.multiply(BigDecimal.valueOf(0.10));
        
        // Canal fees (if applicable - Suez, Panama)
        BigDecimal canalFees = calculateCanalFees(originPort, destPort, distanceNm);
        
        // Security surcharge - ~2% of freight
        BigDecimal securitySurcharge = freightCost.multiply(BigDecimal.valueOf(0.02));
        
        // Insurance (0.3% to 0.5% of FOB + Freight)
        BigDecimal insuranceRate = getInsuranceRate(incoterm);
        BigDecimal insuranceCost = fobValue.add(freightCost)
            .multiply(insuranceRate)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // Total cost
        BigDecimal totalCost = freightCost
            .add(fixedFees)
            .add(originPortFees)
            .add(destPortFees)
            .add(bunkerSurcharge)
            .add(canalFees)
            .add(securitySurcharge)
            .add(insuranceCost);
        
        return MaritimeTransportCostDto.builder()
            .vesselMmsi(vesselMmsi)
            .vesselName(vesselName)
            .originPortName(originPort.getNomPort())
            .destPortName(destPort.getNomPort())
            .distanceNm(route.getDistanceNm())
            .distanceKm(route.getDistanceKm())
            .estimatedDays(route.getEstimatedDays())
            .weightTonnes(weightTonnes)
            .freightCost(freightCost)
            .originPortFees(originPortFees)
            .destPortFees(destPortFees)
            .bunkerSurcharge(bunkerSurcharge)
            .canalFees(canalFees)
            .securitySurcharge(securitySurcharge)
            .insuranceCost(insuranceCost)
            .totalCost(totalCost)
            .dataSource(route.getDataSource())
            .build();
    }
    
    private String getPortUnlocode(Port port) {
        if (port.getUnlocode() != null && !port.getUnlocode().trim().isEmpty()) {
            return port.getUnlocode().trim().toUpperCase();
        }

        // Extract UN/LOCODE from port data
        // Format: FRPAR (France - Paris), NLRTM (Netherlands - Rotterdam)
        String countryCode = getCountryCode(port.getPays());
        String portCode = port.getNomPort().substring(0, Math.min(3, port.getNomPort().length())).toUpperCase();
        return countryCode + portCode;
    }
    
    private String getCountryCode(String countryName) {
        // Map country names to ISO 2-letter codes
        switch (countryName.toLowerCase()) {
            case "france": return "FR";
            case "allemagne": case "germany": return "DE";
            case "pays-bas": case "netherlands": return "NL";
            case "belgique": case "belgium": return "BE";
            case "espagne": case "spain": return "ES";
            case "italie": case "italy": return "IT";
            case "royaume-uni": case "united kingdom": return "GB";
            case "chine": case "china": return "CN";
            case "singapour": case "singapore": return "SG";
            case "japon": case "japan": return "JP";
            case "états-unis": case "united states": return "US";
            case "brésil": case "brazil": return "BR";
            default: return "XX";
        }
    }
    
    private BigDecimal calculatePortFees(Port port, BigDecimal weightTonnes) {
        // Base fee + weight-based fee
        BigDecimal baseFee = BigDecimal.valueOf(200);
        BigDecimal weightFee = weightTonnes.multiply(BigDecimal.valueOf(5)); // $5 per tonne
        return baseFee.add(weightFee);
    }
    
    private BigDecimal calculateCanalFees(Port originPort, Port destPort, BigDecimal distanceNm) {
        // Check if route likely passes through major canals
        String origin = originPort.getPays().toLowerCase();
        String dest = destPort.getPays().toLowerCase();
        
        // Suez Canal (Europe-Asia routes)
        boolean usesSuez = (isEurope(origin) && isAsia(dest)) || (isAsia(origin) && isEurope(dest));
        
        // Panama Canal (Americas-Asia routes)
        boolean usesPanama = (isAmericas(origin) && isAsia(dest)) || (isAsia(origin) && isAmericas(dest));
        
        if (usesSuez) {
            return BigDecimal.valueOf(300000); // Suez average fee
        } else if (usesPanama) {
            return BigDecimal.valueOf(450000); // Panama average fee
        }
        
        return BigDecimal.ZERO;
    }
    
    private boolean isEurope(String country) {
        return country.matches(".*(france|allemagne|germany|pays-bas|netherlands|belgique|belgium|espagne|spain|italie|italy|royaume-uni|united kingdom).*");
    }
    
    private boolean isAsia(String country) {
        return country.matches(".*(chine|china|singapour|singapore|japon|japan|corée|korea|inde|india|thaïlande|thailand).*");
    }
    
    private boolean isAmericas(String country) {
        return country.matches(".*(états-unis|united states|canada|mexique|mexico|brésil|brazil|argentine|argentina|chili|chile).*");
    }
    
    private BigDecimal getInsuranceRate(String incoterm) {
        // Insurance rates vary by incoterm
        switch (incoterm.toUpperCase()) {
            case "CIF":
            case "CIP":
                return BigDecimal.valueOf(0.5); // 0.5%
            case "CFR":
            case "CPT":
                return BigDecimal.valueOf(0.3); // 0.3%
            default:
                return BigDecimal.valueOf(0.4); // 0.4% default
        }
    }
}
