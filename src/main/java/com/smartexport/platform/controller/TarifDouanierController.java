package com.smartexport.platform.controller;

import com.smartexport.platform.dto.TarifDouanierDto;
import com.smartexport.platform.service.TarifDouanierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tarifs-douaniers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TarifDouanierController {
    
    private final TarifDouanierService tarifService;
    
    @GetMapping
    public ResponseEntity<List<TarifDouanierDto>> getAllTarifs() {
        return ResponseEntity.ok(tarifService.getAllTarifs());
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(tarifService.getDistinctCategories());
    }
    
    @GetMapping("/pays")
    public ResponseEntity<List<String>> getPays() {
        return ResponseEntity.ok(tarifService.getDistinctPays());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TarifDouanierDto> getTarifById(@PathVariable Long id) {
        return ResponseEntity.ok(tarifService.getTarifById(id));
    }
    
    @GetMapping("/categorie/{categorie}")
    public ResponseEntity<List<TarifDouanierDto>> getTarifsByCategorie(@PathVariable String categorie) {
        return ResponseEntity.ok(tarifService.getTarifsByCategorie(categorie));
    }
    
    @GetMapping("/pays/{pays}")
    public ResponseEntity<List<TarifDouanierDto>> getTarifsByPays(@PathVariable String pays) {
        return ResponseEntity.ok(tarifService.getTarifsByPays(pays));
    }
    
    @PostMapping
    public ResponseEntity<TarifDouanierDto> createTarif(@Valid @RequestBody TarifDouanierDto dto) {
        TarifDouanierDto created = tarifService.createTarif(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<TarifDouanierDto> updateTarif(
            @PathVariable Long id,
            @Valid @RequestBody TarifDouanierDto dto) {
        TarifDouanierDto updated = tarifService.updateTarif(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTarif(@PathVariable Long id) {
        tarifService.deleteTarif(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/search")
    public ResponseEntity<TarifDouanierDto> searchTarif(
            @RequestParam String codeHs,
            @RequestParam String pays) {
        TarifDouanierDto result = tarifService.searchTarif(codeHs, pays);
        return ResponseEntity.ok(result);
    }
}
