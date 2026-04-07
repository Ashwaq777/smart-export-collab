package com.smartexport.platform.service;

import com.smartexport.platform.dto.TarifDouanierDto;
import com.smartexport.platform.entity.TarifDouanier;
import com.smartexport.platform.repository.TarifDouanierRepository;
import com.smartexport.platform.util.HsCodeUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarifDouanierService {
    
    private final TarifDouanierRepository tarifRepository;
    
    @Transactional(readOnly = true)
    public List<TarifDouanierDto> getAllTarifs() {
        return tarifRepository.findAll().stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public TarifDouanierDto getTarifById(Long id) {
        TarifDouanier tarif = tarifRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarif non trouvé avec l'id: " + id));
        return toDto(tarif);
    }
    
    @Transactional(readOnly = true)
    public List<TarifDouanierDto> getTarifsByCategorie(String categorie) {
        return tarifRepository.findByCategorie(categorie).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<TarifDouanierDto> getTarifsByPays(String pays) {
        return tarifRepository.findByPaysDestination(pays).stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public TarifDouanierDto createTarif(TarifDouanierDto dto) {
        if (!HsCodeUtil.isValid(dto.getCodeHs())) {
            throw new IllegalArgumentException("Code HS invalide: " + dto.getCodeHs());
        }
        
        TarifDouanier tarif = new TarifDouanier();
        tarif.setCodeHs(HsCodeUtil.normalize(dto.getCodeHs()));
        tarif.setNomProduit(dto.getNomProduit());
        tarif.setCategorie(dto.getCategorie());
        tarif.setPaysDestination(dto.getPaysDestination());
        tarif.setTauxDouane(dto.getTauxDouane());
        tarif.setTauxTva(dto.getTauxTva());
        tarif.setTaxeParafiscale(dto.getTaxeParafiscale());
        
        TarifDouanier saved = tarifRepository.save(tarif);
        return toDto(saved);
    }
    
    @Transactional
    public TarifDouanierDto updateTarif(Long id, TarifDouanierDto dto) {
        if (!HsCodeUtil.isValid(dto.getCodeHs())) {
            throw new IllegalArgumentException("Code HS invalide: " + dto.getCodeHs());
        }
        
        TarifDouanier tarif = tarifRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Tarif non trouvé avec l'id: " + id));
        
        tarif.setCodeHs(HsCodeUtil.normalize(dto.getCodeHs()));
        tarif.setNomProduit(dto.getNomProduit());
        tarif.setCategorie(dto.getCategorie());
        tarif.setPaysDestination(dto.getPaysDestination());
        tarif.setTauxDouane(dto.getTauxDouane());
        tarif.setTauxTva(dto.getTauxTva());
        tarif.setTaxeParafiscale(dto.getTaxeParafiscale());
        
        TarifDouanier updated = tarifRepository.save(tarif);
        return toDto(updated);
    }
    
    @Transactional
    public void deleteTarif(Long id) {
        if (!tarifRepository.existsById(id)) {
            throw new RuntimeException("Tarif non trouvé avec l'id: " + id);
        }
        tarifRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public TarifDouanierDto searchTarif(String codeHs, String pays) {
        String normalizedCodeHs = HsCodeUtil.normalize(codeHs);
        TarifDouanier tarif = tarifRepository.findByCodeHsAndPaysDestination(normalizedCodeHs, pays)
            .orElseThrow(() -> new RuntimeException(
                "Aucun tarif trouvé pour le code HS: " + codeHs + " et le pays: " + pays));
        return toDto(tarif);
    }
    
    @Transactional(readOnly = true)
    public List<String> getDistinctCategories() {
        return tarifRepository.findAll().stream()
            .map(TarifDouanier::getCategorie)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<String> getDistinctPays() {
        return tarifRepository.findAll().stream()
            .map(TarifDouanier::getPaysDestination)
            .distinct()
            .sorted()
            .collect(Collectors.toList());
    }
    
    private TarifDouanierDto toDto(TarifDouanier entity) {
        return new TarifDouanierDto(
            entity.getId(),
            entity.getCodeHs(),
            entity.getNomProduit(),
            entity.getCategorie(),
            entity.getPaysDestination(),
            entity.getTauxDouane(),
            entity.getTauxTva(),
            entity.getTaxeParafiscale()
        );
    }
}
