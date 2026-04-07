package com.smartexport.platform.carbon;

import com.smartexport.platform.carbon.dto.CarbonRequestDTO;
import com.smartexport.platform.carbon.dto.CarbonResponseDTO;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.PortRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class CarbonCalculationService {

    private static final Logger log = LoggerFactory.getLogger(CarbonCalculationService.class);
    private static final Double CARBON_PRICE_EUR = 85.0;
    
    private static final Map<String, String> COUNTRY_FR_MAP = Map.ofEntries(
        Map.entry("germany", "allemagne"),
        Map.entry("france", "france"),
        Map.entry("spain", "espagne"),
        Map.entry("italy", "italie"),
        Map.entry("netherlands", "pays-bas"),
        Map.entry("belgium", "belgique"),
        Map.entry("portugal", "portugal"),
        Map.entry("morocco", "maroc"),
        Map.entry("united kingdom", "royaume-uni"),
        Map.entry("uk", "royaume-uni"),
        Map.entry("china", "chine"),
        Map.entry("united states", "états-unis"),
        Map.entry("usa", "états-unis"),
        Map.entry("brazil", "brésil"),
        Map.entry("turkey", "turquie"),
        Map.entry("egypt", "égypte"),
        Map.entry("saudi arabia", "arabie saoudite"),
        Map.entry("south africa", "afrique du sud"),
        Map.entry("india", "inde"),
        Map.entry("japan", "japon"),
        Map.entry("south korea", "corée du sud"),
        Map.entry("canada", "canada"),
        Map.entry("australia", "australie"),
        Map.entry("greece", "grèce"),
        Map.entry("poland", "pologne"),
        Map.entry("denmark", "danemark"),
        Map.entry("sweden", "suède"),
        Map.entry("norway", "norvège"),
        Map.entry("finland", "finlande"),
        Map.entry("singapore", "singapour"),
        Map.entry("malaysia", "malaisie"),
        Map.entry("indonesia", "indonésie"),
        Map.entry("thailand", "thaïlande"),
        Map.entry("vietnam", "viêt nam"),
        Map.entry("nigeria", "nigéria"),
        Map.entry("senegal", "sénégal"),
        Map.entry("algeria", "algérie"),
        Map.entry("tunisia", "tunisie"),
        Map.entry("ghana", "ghana"),
        Map.entry("kenya", "kenya"),
        Map.entry("colombia", "colombie"),
        Map.entry("chile", "chili"),
        Map.entry("argentina", "argentine"),
        Map.entry("mexico", "mexique"),
        Map.entry("peru", "pérou"),
        Map.entry("panama", "panama"),
        Map.entry("united arab emirates", "émirats arabes unis"),
        Map.entry("uae", "émirats arabes unis")
    );
    
    private final CarbonFactorRepository carbonFactorRepository;
    private final PortRepository portRepository;

    public CarbonCalculationService(CarbonFactorRepository carbonFactorRepository, 
                                  PortRepository portRepository) {
        this.carbonFactorRepository = carbonFactorRepository;
        this.portRepository = portRepository;
    }

    private String extractPortName(String input) {
        if (input == null) return "";
        return input
            .replaceAll("(?i)^port of ", "")
            .replaceAll("(?i)^port de ", "")
            .replaceAll("(?i)^port du ", "")
            .trim();
    }

    private String normalizeCountryName(String name) {
        if (name == null) return "";
        String lower = name.toLowerCase().trim();
        return COUNTRY_FR_MAP.getOrDefault(lower, lower);
    }

    private double haversineDistanceKm(
        double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // rayon Terre en km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
                 + Math.cos(Math.toRadians(lat1)) 
                 * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    public CarbonResponseDTO calculate(CarbonRequestDTO req) {
        Double distance;
        
        // Priorité 1 : coordonnées directes fournies par le frontend
        if (req.getOriginLat() != null && req.getOriginLng() != null &&
            req.getDestLat() != null && req.getDestLng() != null) {
            double directDistance = haversineDistanceKm(
              req.getOriginLat(), req.getOriginLng(),
              req.getDestLat(), req.getDestLng()
            );
            distance = directDistance * 1.25;
            log.debug("Distance via coordonnées directes: {} km", distance);
        } else {
            // Priorité 2 : recherche par nom dans la DB (fallback)
            // Normaliser les noms de pays pour la recherche de ports
            String originNormalized = normalizeCountryName(extractPortName(req.getOrigin()));
            String destNormalized = normalizeCountryName(extractPortName(req.getDestination()));
            
            // Chercher les ports par nom approximatif
            List<Port> originPorts = portRepository.findByNameContainingIgnoreCase(originNormalized);
            List<Port> destPorts = portRepository.findByNameContainingIgnoreCase(destNormalized);
            
            if (!originPorts.isEmpty() && !destPorts.isEmpty()) {
                Port originPort = originPorts.get(0);
                Port destPort = destPorts.get(0);
                
                // Vérifier si les ports ont des coordonnées valides
                if (originPort.getLatitude() != null && originPort.getLongitude() != null &&
                    destPort.getLatitude() != null && destPort.getLongitude() != null &&
                    originPort.getLatitude().doubleValue() != 0 && originPort.getLongitude().doubleValue() != 0 &&
                    destPort.getLatitude().doubleValue() != 0 && destPort.getLongitude().doubleValue() != 0) {
                    
                    // Calculer la distance Haversine
                    double directDistance = haversineDistanceKm(
                        originPort.getLatitude().doubleValue(),
                        originPort.getLongitude().doubleValue(),
                        destPort.getLatitude().doubleValue(),
                        destPort.getLongitude().doubleValue()
                    );
                    
                    // Multiplier par 1.25 pour tenir compte des routes maritimes réelles
                    distance = directDistance * 1.25;
                    
                    log.debug("Distance calculée entre {} ({}) et {} ({}) : {} km (direct: {} km)", 
                        req.getOrigin(), originPort.getNomPort(), 
                        req.getDestination(), destPort.getNomPort(), 
                        distance, directDistance);
                } else {
                    log.warn("Coordonnées manquantes ou invalides pour les ports: {} ou {}", 
                        req.getOrigin(), req.getDestination());
                    distance = 500.0; // distance par défaut minimum raisonnable
                }
            } else {
                log.warn("Ports non trouvés: {} ou {}", req.getOrigin(), req.getDestination());
                distance = 500.0; // distance par défaut minimum raisonnable
            }
        }

        CarbonFactor factor = carbonFactorRepository.findByTransportMode(req.getTransportMode())
            .orElseThrow(() -> new CarbonFactorNotFoundException("Transport mode not found: " + req.getTransportMode()));

        BigDecimal emissionFactor = factor.getEmissionFactor();
        BigDecimal weight = BigDecimal.valueOf(req.getWeightTon());
        BigDecimal distanceBD = BigDecimal.valueOf(distance);
        
        BigDecimal co2KgBD = distanceBD.multiply(emissionFactor).multiply(weight);
        Double co2Kg = co2KgBD.doubleValue();
        
        Double co2Tonnes = co2Kg / 1000.0;
        
        BigDecimal cbamTaxBD = BigDecimal.valueOf(co2Tonnes).multiply(BigDecimal.valueOf(CARBON_PRICE_EUR));
        Double cbamTaxEur = cbamTaxBD.setScale(2, RoundingMode.HALF_UP).doubleValue();

        String equation = String.format("%.1f km × %.6f × %.1f t = %.1f kg CO₂", 
            distance, emissionFactor.doubleValue(), req.getWeightTon(), co2Kg);
        String formulaDisplay = "CO₂ = Distance × Facteur_Émission × Poids";

        CarbonResponseDTO response = new CarbonResponseDTO();
        response.setCo2Kg(co2Kg);
        response.setCo2Tonnes(co2Tonnes);
        response.setCbamTaxEur(cbamTaxEur);
        response.setDistanceKm(distance);
        response.setEquation(equation);
        response.setFormulaDisplay(formulaDisplay);
        
        return response;
    }
}
