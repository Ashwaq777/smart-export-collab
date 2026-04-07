package com.smartexport.platform.controller;

import com.smartexport.platform.dto.*;
import com.smartexport.platform.service.CalculationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/calculation")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CalculationController {
    
    private final CalculationService calculationService;
    
    @PostMapping("/landed-cost")
    public ResponseEntity<LandedCostResultDto> calculateLandedCost(
            @Valid @RequestBody LandedCostCalculationDto request) {
        LandedCostResultDto result = calculationService.calculateLandedCost(request);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/alerte-seuil")
    public ResponseEntity<AlerteSeuilDto> verifierSeuilEps(
            @RequestParam String codeHs,
            @RequestParam BigDecimal valeurSaisie) {
        AlerteSeuilDto result = calculationService.verifierSeuilEps(codeHs, valeurSaisie);
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/risque-change")
    public ResponseEntity<RisqueChangeDto> calculerRisqueChange(
            @RequestParam String deviseSource,
            @RequestParam String deviseCible,
            @RequestParam BigDecimal tauxActuel,
            @RequestParam BigDecimal montantInitial) {
        RisqueChangeDto result = calculationService.calculerRisqueChange(
            deviseSource, deviseCible, tauxActuel, montantInitial
        );
        return ResponseEntity.ok(result);
    }
}
