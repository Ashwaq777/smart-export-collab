package com.smartexport.platform.vessels.service;

import com.smartexport.platform.vessels.dto.VesselPositionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@Slf4j
public class VesselDistanceService {

    private final WebClient webClient;

    @Value("${vessel.tracking.api-key}")
    private String apiKey;

    @Value("${vessel.tracking.proximity-threshold-km:5.0}")
    private double proximityThreshold;

    public VesselDistanceService(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    public Mono<VesselPositionDTO> getVesselPosition(String imo) {
        return webClient.get()
            .uri(u -> u.scheme("https")
                .host("api.marinesia.com")
                .path("/api/v2/vessel/location/latest")
                .queryParam("imo", imo)
                .queryParam("key", apiKey)
                .build())
            .retrieve()
            .bodyToMono(Map.class)
            .map(map -> {
                Map<String, Object> data = 
                    (Map<String, Object>) map.get("data");
                VesselPositionDTO dto = new VesselPositionDTO();
                dto.setImo(imo);
                dto.setLatitude(
                    ((Number) data.get("lat")).doubleValue());
                dto.setLongitude(
                    ((Number) data.get("lng")).doubleValue());
                dto.setVesselName(
                    String.valueOf(
                        data.getOrDefault("name", "Unknown")));
                dto.setSpeed(data.get("speed") != null ?
                    ((Number) data.get("speed")).doubleValue() 
                    : null);
                dto.setDestination(
                    String.valueOf(
                        data.getOrDefault("destination", "")));
                dto.setStatus(
                    String.valueOf(
                        data.getOrDefault("status", "UNKNOWN")));
                log.info("Vessel {} at {},{}", 
                    dto.getVesselName(),
                    dto.getLatitude(), 
                    dto.getLongitude());
                return dto;
            })
            .onErrorResume(e -> {
                log.error("Failed to fetch vessel {}: {}",
                    imo, e.getMessage());
                return Mono.empty();
            });
    }

    public Mono<Double> calculateDistanceToPlace(
            String imo, String place) {
        // Get place coords via Nominatim
        Mono<Double[]> placeMono = webClient.get()
            .uri("https://nominatim.openstreetmap.org/search"
                + "?q=" + place + "&format=json&limit=1")
            .header("User-Agent", "SmartExportGlobal/1.0")
            .retrieve()
            .bodyToMono(Object[].class)
            .map(arr -> {
                var first = (Map<String, Object>) arr[0];
                double lat = Double.parseDouble(
                    (String) first.get("lat"));
                double lon = Double.parseDouble(
                    (String) first.get("lon"));
                return new Double[]{lat, lon};
            });

        // Get vessel position
        Mono<Double[]> vesselMono = getVesselPosition(imo)
            .map(v -> new Double[]{
                v.getLatitude(), v.getLongitude()});

        // Calculate distance
        return Mono.zip(placeMono, vesselMono)
            .map(tuple -> {
                Double[] p = tuple.getT1();
                Double[] v = tuple.getT2();
                return haversine(p[0], p[1], v[0], v[1]);
            });
    }

    public double haversine(double lat1, double lon1,
                             double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat/2) * Math.sin(dLat/2)
            + Math.cos(Math.toRadians(lat1))
            * Math.cos(Math.toRadians(lat2))
            * Math.sin(dLon/2) * Math.sin(dLon/2);
        double c = 2 * Math.atan2(
            Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    public boolean isNearPort(double vesselLat,
                               double vesselLon,
                               double portLat,
                               double portLon) {
        return haversine(vesselLat, vesselLon,
            portLat, portLon) <= proximityThreshold;
    }
}
