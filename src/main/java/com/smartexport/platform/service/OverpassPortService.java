package com.smartexport.platform.service;

import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.PortRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import jakarta.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OverpassPortService {

    @Autowired
    private PortRepository portRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String OVERPASS_URL =
        "https://overpass-api.de/api/interpreter";

    // Alternative mirrors if main is rate-limited
    private static final String[] MIRRORS = {
        "https://overpass-api.de/api/interpreter",
        "https://overpass.karte.io/api/interpreter",
        "https://overpass.openstreetmap.ru/api/interpreter"
    };

    @PostConstruct
    public void init() {
        long count = portRepository.count();
        log.info("[OSM] Current ports in DB: {}", count);
        if (count < 150) {
            log.info("[OSM] Starting background port sync...");
            new Thread(this::syncFromOSM).start();
        }
    }

    public Map<String, Object> syncFromOSM() {
        int totalSaved = 0;

        // Load existing port names to avoid duplicates
        Set<String> existing = portRepository.findAll().stream()
            .map(p -> {
                String n = p.getNomPort() != null ? p.getNomPort() : "";
                return n.toLowerCase().trim();
            })
            .filter(s -> !s.isEmpty())
            .collect(Collectors.toSet());

        log.info("[OSM] Existing ports: {}", existing.size());

        // Single global query — most efficient, avoids multiple rate-limit hits
        // Fetches seamark harbours AND harbour=yes nodes globally
        String query = "[out:json][timeout:90];" +
            "(" +
            "node[\"seamark:type\"=\"harbour\"][\"name\"];" +
            "node[\"harbour\"=\"yes\"][\"name\"];" +
            "node[\"seamark:type\"=\"port\"][\"name\"];" +
            ");" +
            "out 2000;";

        for (String mirror : MIRRORS) {
            try {
                log.info("[OSM] Trying mirror: {}", mirror);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
                headers.set("User-Agent", "SmartExportPlatform/1.0");
                HttpEntity<String> entity = new HttpEntity<>(
                    "data=" + java.net.URLEncoder.encode(query, "UTF-8"), headers);

                ResponseEntity<Map> response = restTemplate.exchange(
                    mirror, HttpMethod.POST, entity, Map.class);

                if (response.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
                    log.warn("[OSM] Rate limited on {}, trying next...", mirror);
                    Thread.sleep(5000);
                    continue;
                }

                if (response.getBody() == null) continue;
                List<Map> elements = (List<Map>) response.getBody().get("elements");
                if (elements == null || elements.isEmpty()) continue;

                log.info("[OSM] Got {} elements from {}", elements.size(), mirror);

                List<Port> batch = new ArrayList<>();
                for (Map el : elements) {
                    try {
                        Map<String, String> tags = (Map<String, String>) el.get("tags");
                        if (tags == null) continue;

                        String name = tags.get("name");
                        if (name == null || name.trim().isEmpty()) continue;
                        if (existing.contains(name.toLowerCase().trim())) continue;

                        Double lat = el.get("lat") instanceof Number ?
                            ((Number) el.get("lat")).doubleValue() : null;
                        Double lon = el.get("lon") instanceof Number ?
                            ((Number) el.get("lon")).doubleValue() : null;
                        if (lat == null || lon == null) continue;

                        // Skip landlocked (far from coast) — rough filter
                        String nameEn = tags.getOrDefault("name:en", name);
                        String country = tags.getOrDefault("addr:country",
                            tags.getOrDefault("country:code",
                            tags.getOrDefault("ISO3166-1", "")));
                        String unlocode = tags.getOrDefault(
                            "seamark:harbour:unlocode",
                            tags.getOrDefault("ref:LOCODE",
                            tags.getOrDefault("ref", "")));
                        String type = tags.getOrDefault("seamark:type",
                            tags.getOrDefault("harbour:type", "harbour"));

                        Port port = new Port();
                        port.setNomPort(nameEn);
                        port.setPays(country);
                        port.setUnlocode(unlocode);
                        port.setTypePort(mapPortType(type));
                        port.setLatitude(java.math.BigDecimal.valueOf(lat));
                        port.setLongitude(java.math.BigDecimal.valueOf(lon));
                        port.setFraisPortuaires(java.math.BigDecimal.valueOf(getFeesByCountry(country)));

                        batch.add(port);
                        existing.add(name.toLowerCase().trim());
                    } catch (Exception e) {
                        // skip
                    }
                }

                if (!batch.isEmpty()) {
                    portRepository.saveAll(batch);
                    totalSaved += batch.size();
                    log.info("[OSM] Saved {} ports. DB total: {}", batch.size(), portRepository.count());
                }
                break; // Success — no need to try other mirrors

            } catch (Exception e) {
                log.error("[OSM] Mirror failed: {} — {}", mirror, e.getMessage());
                try { Thread.sleep(3000); } catch (Exception ignored) {}
            }
        }

        log.info("[OSM] Sync complete. New ports: {}", totalSaved);
        Map<String, Object> result = new HashMap<>();
        result.put("newPorts", totalSaved);
        result.put("totalPorts", portRepository.count());
        result.put("source", "OpenStreetMap Overpass API");
        return result;
    }

    private double getFeesByCountry(String code) {
        if (code == null || code.isEmpty()) return 2500.0;
        Map<String, Double> f = new HashMap<>();
        f.put("NL",3500.0); f.put("BE",3300.0); f.put("DE",3400.0);
        f.put("GB",3400.0); f.put("FR",3200.0); f.put("ES",2900.0);
        f.put("IT",3000.0); f.put("GR",2900.0); f.put("PT",2800.0);
        f.put("SE",3200.0); f.put("DK",3000.0); f.put("NO",3100.0);
        f.put("FI",3000.0); f.put("PL",2700.0); f.put("TR",2800.0);
        f.put("US",4000.0); f.put("CA",3700.0); f.put("MX",3000.0);
        f.put("BR",3200.0); f.put("AR",3100.0); f.put("CL",3000.0);
        f.put("MA",2600.0); f.put("EG",2600.0); f.put("DZ",2400.0);
        f.put("TN",2400.0); f.put("NG",2600.0); f.put("ZA",2700.0);
        f.put("KE",2600.0); f.put("TZ",2500.0); f.put("GH",2500.0);
        f.put("AE",3200.0); f.put("SA",3100.0); f.put("KW",3000.0);
        f.put("QA",3000.0); f.put("OM",2900.0); f.put("IL",2800.0);
        f.put("CN",2800.0); f.put("JP",3500.0); f.put("KR",3100.0);
        f.put("SG",3000.0); f.put("IN",2800.0); f.put("AU",3700.0);
        f.put("NZ",3500.0); f.put("MY",2700.0); f.put("TH",2800.0);
        f.put("VN",2700.0); f.put("PH",2700.0); f.put("ID",2600.0);
        f.put("TW",2900.0); f.put("HK",3000.0);
        return f.getOrDefault(code.toUpperCase(), 2500.0);
    }

    private String mapPortType(String osmType) {
        if (osmType == null) return "Maritime";
        switch (osmType.toLowerCase()) {
            case "harbour": return "Maritime";
            case "port": return "Maritime";
            case "ferry": return "Maritime";
            case "fishing": return "Maritime";
            case "marina": return "Maritime";
            case "naval": return "Maritime";
            case "military": return "Maritime";
            case "industrial": return "Maritime";
            default: return "Maritime";
        }
    }
}
