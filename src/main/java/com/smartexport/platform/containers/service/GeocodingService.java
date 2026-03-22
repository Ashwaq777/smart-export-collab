package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.GeocodingResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class GeocodingService {

    private final WebClient webClient;

    private static final String NOMINATIM_URL =
            "https://nominatim.openstreetmap.org";

    public GeocodingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
                .baseUrl(NOMINATIM_URL)
                .defaultHeader("User-Agent", "SmartExportGlobal/1.0")
                .build();
    }

    public Optional<GeocodingResult> geocode(String address) {
        log.info("Geocoding address: {}", address);
        if (address == null || address.isBlank()) {
            return Optional.empty();
        }
        try {
            List<Map<String, Object>> results = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", address)
                            .queryParam("format", "json")
                            .queryParam("limit", "1")
                            .build())
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            if (results == null || results.isEmpty()) {
                log.warn("No geocoding results for address: {}", address);
                return Optional.empty();
            }

            Map<String, Object> first = results.get(0);
            double lat = Double.parseDouble((String) first.get("lat"));
            double lon = Double.parseDouble((String) first.get("lon"));
            String displayName = (String) first.get("display_name");

            log.info("Geocoding result: lat={} lon={}", lat, lon);
            log.info("Geocoded '{}' → lat={}, lon={}", address, lat, lon);
            return Optional.of(new GeocodingResult(lat, lon, displayName));

        } catch (Exception e) {
            log.error("Geocoding failed for address '{}': {}", address, e.getMessage());
            return Optional.empty();
        }
    }
}
