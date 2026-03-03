package com.smartexport.platform.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service pour récupérer les navires en temps réel via API AIS gratuite
 * Utilise AISHub API (gratuit) ou VesselFinder API (free tier)
 */
@Service
public class VesselAisService {
    
    private static final Logger logger = LoggerFactory.getLogger(VesselAisService.class);
    
    @Value("${aishub.api.key:demo}")
    private String aisHubApiKey;
    
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public VesselAisService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    /**
     * Récupère les navires présents dans un port via coordonnées
     * Cache pendant 30 minutes (les navires changent lentement)
     */
    @Cacheable(value = "vesselsByPort", key = "#latitude + '-' + #longitude")
    public List<VesselInfo> getVesselsByPort(double latitude, double longitude, String portName) {
        try {
            if (aisHubApiKey == null || aisHubApiKey.trim().isEmpty() || "demo".equalsIgnoreCase(aisHubApiKey.trim())) {
                logger.warn("AISHub API key not configured. Returning empty vessel list for port {}", portName);
                return new ArrayList<>();
            }

            // AISHub API - Free tier
            // Format: http://data.aishub.net/ws.php?username=XX&format=1&output=json&compress=0&latmin=XX&latmax=XX&lonmin=XX&lonmax=XX
            
            double latRange = 0.1; // ~11km radius
            double lonRange = 0.1;
            
            String url = String.format(
                "http://data.aishub.net/ws.php?username=%s&format=1&output=json&compress=0&latmin=%.4f&latmax=%.4f&lonmin=%.4f&lonmax=%.4f",
                aisHubApiKey,
                latitude - latRange,
                latitude + latRange,
                longitude - lonRange,
                longitude + lonRange
            );
            
            logger.info("Calling AISHub API for port: {} ({}, {})", portName, latitude, longitude);
            
            String response = restTemplate.getForObject(url, String.class);
            if (response == null || response.trim().isEmpty()) {
                logger.warn("Empty AIS response for port {}. Returning empty vessel list.", portName);
                return new ArrayList<>();
            }
            JsonNode root = objectMapper.readTree(response);
            
            List<VesselInfo> vessels = new ArrayList<>();
            
            if (root.isArray()) {
                for (JsonNode vesselNode : root) {
                    if (vesselNode.has("NAME") && vesselNode.has("MMSI")) {
                        VesselInfo vessel = new VesselInfo(
                            vesselNode.get("NAME").asText("Unknown"),
                            vesselNode.get("MMSI").asText(),
                            vesselNode.has("TYPE") ? getVesselType(vesselNode.get("TYPE").asInt()) : "Cargo",
                            vesselNode.has("TIME") ? vesselNode.get("TIME").asText() : LocalDateTime.now().toString(),
                            vesselNode.has("SPEED") ? vesselNode.get("SPEED").asDouble() : 0.0,
                            vesselNode.has("COURSE") ? vesselNode.get("COURSE").asDouble() : 0.0,
                            "AISHUB_API"
                        );
                        vessels.add(vessel);
                    }
                }
            }
            
            logger.info("Found {} vessels near port {}", vessels.size(), portName);
            
            // Si aucun navire trouvé via API, retourner liste vide (pas de fallback hardcodé)
            return vessels;
            
        } catch (Exception e) {
            logger.error("Error calling AIS API for port {}: {}", portName, e.getMessage());
            return new ArrayList<>();
        }
    }
    
    private String getVesselType(int typeCode) {
        // AIS vessel type codes
        if (typeCode >= 70 && typeCode <= 79) return "Cargo";
        if (typeCode >= 80 && typeCode <= 89) return "Tanker";
        if (typeCode >= 60 && typeCode <= 69) return "Passenger";
        if (typeCode == 30) return "Fishing";
        if (typeCode >= 40 && typeCode <= 49) return "High Speed Craft";
        if (typeCode == 50) return "Pilot Vessel";
        if (typeCode == 51) return "Search and Rescue";
        if (typeCode == 52) return "Tug";
        if (typeCode >= 31 && typeCode <= 32) return "Towing";
        return "Other";
    }
    
    public static class VesselInfo {
        private final String name;
        private final String mmsi;
        private final String type;
        private final String lastUpdate;
        private final double speed;
        private final double course;
        private final String dataSource;
        
        public VesselInfo(String name, String mmsi, String type, String lastUpdate, 
                         double speed, double course, String dataSource) {
            this.name = name;
            this.mmsi = mmsi;
            this.type = type;
            this.lastUpdate = lastUpdate;
            this.speed = speed;
            this.course = course;
            this.dataSource = dataSource;
        }
        
        public String getName() { return name; }
        public String getMmsi() { return mmsi; }
        public String getType() { return type; }
        public String getLastUpdate() { return lastUpdate; }
        public double getSpeed() { return speed; }
        public double getCourse() { return course; }
        public String getDataSource() { return dataSource; }
    }
}
