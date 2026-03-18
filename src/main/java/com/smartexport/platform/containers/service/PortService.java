package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.PortDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("containerPortService")
@Slf4j
public class PortService {

    private final WebClient nominatimClient;
    private final WebClient countriesClient;

    public PortService(WebClient.Builder webClientBuilder) {
        this.nominatimClient = webClientBuilder
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "SmartExportGlobal/1.0")
                .build();
        this.countriesClient = webClientBuilder
                .baseUrl("https://restcountries.com")
                .build();
    }

    public List<PortDTO> searchPorts(String query) {
        if (query == null || query.isBlank() || query.length() < 2) {
            return Collections.emptyList();
        }
        try {
            // Try multiple search strategies for better results
            String searchQuery = query.toLowerCase();
            if (!searchQuery.contains("port") && !searchQuery.contains("haven") && !searchQuery.contains("harbour")) {
                searchQuery = query + " port";
            }
            String finalSearchQuery = searchQuery;
            
            List<Map<String, Object>> results = nominatimClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", finalSearchQuery)
                            .queryParam("format", "json")
                            .queryParam("limit", "10")
                            .queryParam("addressdetails", "1")
                            .queryParam("extratags", "1")
                            .build())
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            if (results == null) return Collections.emptyList();

            return results.stream()
                    .filter(r -> isMaritimeLocation(r))
                    .map(r -> mapToPortDTO(r))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Port search failed for '{}': {}", query, e.getMessage());
            return Collections.emptyList();
        }
    }

    public List<PortDTO> searchPortsByCountry(String countryCode) {
        if (countryCode == null || countryCode.isBlank()) {
            return Collections.emptyList();
        }
        try {
            List<Map<String, Object>> results = nominatimClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", "port")
                            .queryParam("format", "json")
                            .queryParam("limit", "20")
                            .queryParam("countrycodes", countryCode.toLowerCase())
                            .queryParam("addressdetails", "1")
                            .queryParam("extratags", "1")
                            .build())
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            if (results == null) return Collections.emptyList();

            return results.stream()
                    .filter(r -> isMaritimeLocation(r))
                    .map(r -> mapToPortDTO(r))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Port search by country failed for '{}': {}", countryCode, e.getMessage());
            return Collections.emptyList();
        }
    }

    public Optional<PortDTO> getPortDetails(String portName) {
        List<PortDTO> results = searchPorts(portName);
        if (results.isEmpty()) {
            return Optional.empty();
        }
        return Optional.of(results.get(0));
    }

    public boolean validateIsPort(String location) {
        if (location == null || location.isBlank()) return false;
        try {
            List<Map<String, Object>> results = nominatimClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search")
                            .queryParam("q", location)
                            .queryParam("format", "json")
                            .queryParam("limit", "5")
                            .queryParam("extratags", "1")
                            .build())
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            if (results == null || results.isEmpty()) return false;

            return results.stream().anyMatch(r -> isMaritimeLocation(r));

        } catch (Exception e) {
            log.warn("Port validation failed for '{}': {}", location, e.getMessage());
            return false;
        }
    }

    public Map<String, Object> getCountryInfo(String countryCode) {
        try {
            List<Map<String, Object>> results = countriesClient.get()
                    .uri("/v3.1/alpha/" + countryCode)
                    .retrieve()
                    .bodyToFlux(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .collectList()
                    .block();

            if (results != null && !results.isEmpty()) {
                return results.get(0);
            }
        } catch (Exception e) {
            log.error("Country info failed for '{}': {}", countryCode, e.getMessage());
        }
        return Collections.emptyMap();
    }

    private boolean isMaritimeLocation(Map<String, Object> result) {
        String type = String.valueOf(result.getOrDefault("type", ""));
        String cls = String.valueOf(result.getOrDefault("class", ""));
        String name = String.valueOf(result.getOrDefault("display_name", ""));
        String osmType = String.valueOf(result.getOrDefault("osm_type", ""));
        
        // Check class/type
        List<String> maritimeTypes = Arrays.asList(
                "harbour", "port", "dock", "marina", "terminal",
                "industrial", "waterway", "pier");
        if (maritimeTypes.contains(type) || maritimeTypes.contains(cls)) {
            return true;
        }
        
        // Check name contains maritime keywords
        String nameLower = name.toLowerCase();
        List<String> keywords = Arrays.asList(
                "port", "harbour", "harbor", "haven", "terminal",
                "dock", "pier", "wharf", "quay", "marina", "container");
        return keywords.stream().anyMatch(nameLower::contains);
    }

    private PortDTO mapToPortDTO(Map<String, Object> result) {
        PortDTO port = new PortDTO();
        port.setName(String.valueOf(result.getOrDefault("name", result.get("display_name"))));
        port.setDisplayName(String.valueOf(result.getOrDefault("display_name", "")));
        port.setLatitude(Double.parseDouble(String.valueOf(result.get("lat"))));
        port.setLongitude(Double.parseDouble(String.valueOf(result.get("lon"))));
        port.setType(String.valueOf(result.getOrDefault("type", "port")));

        Object address = result.get("address");
        if (address instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> addr = (Map<String, Object>) address;
            port.setCountry(String.valueOf(addr.getOrDefault("country", "")));
            port.setCountryCode(String.valueOf(addr.getOrDefault("country_code", "")).toUpperCase());
        }
        return port;
    }
}
