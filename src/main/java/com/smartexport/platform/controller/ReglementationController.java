package com.smartexport.platform.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.smartexport.platform.entity.ReglementationConfig;
import com.smartexport.platform.service.ReglementationService;

@RestController
@RequestMapping("/api/reglementations")
@CrossOrigin(origins = "*")
public class ReglementationController {

    private final ReglementationService reglementationService;

    public ReglementationController(ReglementationService reglementationService) {
        this.reglementationService = reglementationService;
    }

    @GetMapping
    public ResponseEntity<Map<String, List<ReglementationConfig>>> getAllReglementations() {
        try {
            Map<String, List<ReglementationConfig>> grouped = reglementationService.getReglementationsGroupedByZone();
            return ResponseEntity.ok(grouped);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/zones")
    public ResponseEntity<List<String>> getAllZones() {
        try {
            List<String> zones = reglementationService.getAllZones();
            return ResponseEntity.ok(zones);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/zone/{zone}")
    public ResponseEntity<List<ReglementationConfig>> getReglementationsByZone(@PathVariable String zone) {
        try {
            List<ReglementationConfig> reglementations = reglementationService.getReglementationsByZone(zone);
            return ResponseEntity.ok(reglementations);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ReglementationConfig> getReglementationByCode(@PathVariable String code) {
        try {
            ReglementationConfig reglementation = reglementationService.getReglementationByCode(code);
            if (reglementation == null) {
                return ResponseEntity.status(404).body(null);
            }
            return ResponseEntity.ok(reglementation);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<ReglementationConfig>> searchReglementations(@RequestParam String term) {
        try {
            List<ReglementationConfig> results = reglementationService.searchReglementations(term);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping("/initialize")
    public ResponseEntity<String> initializeReglementations() {
        try {
            reglementationService.initializeReglementations();
            return ResponseEntity.ok("Réglementations initialisées avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur lors de l'initialisation: " + e.getMessage());
        }
    }
}
