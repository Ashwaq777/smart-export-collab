package com.smartexport.platform.service;

import com.smartexport.platform.dto.ImportLandedCostDto;
import com.smartexport.platform.dto.ImportLandedCostResultDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ImportCalculationService {
    
    private static final Logger logger = LoggerFactory.getLogger(ImportCalculationService.class);
    
    private final TarifDouanierService tarifDouanierService;
    private final MaritimeTransportService maritimeTransportService;
    
    public ImportCalculationService(TarifDouanierService tarifDouanierService, 
                                   MaritimeTransportService maritimeTransportService) {
        this.tarifDouanierService = tarifDouanierService;
        this.maritimeTransportService = maritimeTransportService;
    }
    
    public ImportLandedCostResultDto calculateImportLandedCost(ImportLandedCostDto dto) {
        logger.info("DTO reçu : paysOrigine={}, portEmbarquement={}, paysDestination={}, portDechargement={}, valeurFob={}, devise={}", 
                   dto.getPaysOrigine(), dto.getPortEmbarquement(),
                   dto.getPaysDestination(), dto.getPortDechargement(),
                   dto.getValeurFob(), dto.getDevise());
        
        logger.info("Calcul du landed cost import pour pays origine: {}, destination: {}, code HS: {}", 
                   dto.getPaysOrigine(), dto.getPaysDestination(), dto.getCodeHs());
        
        try {
            // Protection des données d'entrée contre null
            BigDecimal valeurFob = dto.getValeurFob() != null ? dto.getValeurFob() : BigDecimal.ZERO;
            BigDecimal assurance = dto.getAssurance() != null ? dto.getAssurance() : BigDecimal.ZERO;
            
            // Si valeur FOB est 0, utiliser une valeur par défaut pour éviter des calculs inutiles
            if (valeurFob.compareTo(BigDecimal.ZERO) <= 0) {
                logger.warn("Valeur FOB est 0 ou négative: {}, utilisation de 1000 par défaut", valeurFob);
                valeurFob = BigDecimal.valueOf(1000.00);
            }
            
            logger.info("Valeurs sécurisées - FOB: {}, Assurance: {}", valeurFob, assurance);
            
            // 1. Calcul du fret maritime (estimation basée sur la distance et les ports)
            BigDecimal fretMaritime = calculateFretMaritime(dto);
            
            // 2. Valeur CIF = FOB + Fret + Assurance
            BigDecimal valeurCif = valeurFob
                .add(fretMaritime)
                .add(assurance);
            
            logger.info("Valeur CIF calculée: {}", valeurCif);
            
            // 3. Droits de douane à l'import (basés sur le code HS et le pays de destination)
            BigDecimal droitsDouaneImport = calculateDroitsDouaneImport(dto, valeurCif);
            
            // 4. TVA à l'import (taux TVA du pays de destination)
            BigDecimal tvaImport = calculateTvaImport(valeurCif, droitsDouaneImport, dto.getPaysDestination());
            
            // 5. Frais portuaires destination
            BigDecimal fraisPortuairesDestination = calculateFraisPortuairesDestination(dto);
            
            // 6. Autres frais (manutention, dédouanement, etc.)
            BigDecimal autresFrais = calculateAutresFrais(dto, valeurCif);
            
            // 7. Total Landed Cost
            BigDecimal totalLandedCost = valeurCif
                .add(droitsDouaneImport)
                .add(tvaImport)
                .add(fraisPortuairesDestination)
                .add(autresFrais);
            
            logger.info("Calculs intermédiaires - Fret: {}, Droits: {}, TVA: {}, Frais: {}, Autres: {}", 
                       fretMaritime, droitsDouaneImport, tvaImport, fraisPortuairesDestination, autresFrais);
            
            // 8. Génération de la référence
            String reference = generateReference();
            
            ImportLandedCostResultDto result = new ImportLandedCostResultDto(
                dto.getValeurFob(),
                fretMaritime,
                dto.getAssurance() != null ? dto.getAssurance() : BigDecimal.ZERO,
                valeurCif,
                droitsDouaneImport,
                tvaImport,
                fraisPortuairesDestination,
                autresFrais,
                totalLandedCost,
                dto.getDevise(),
                reference,
                LocalDateTime.now()
            );
            
            logger.info("Calcul terminé - Total landed cost: {} {}", totalLandedCost, dto.getDevise());
            return result;
            
        } catch (Exception e) {
            logger.error("Erreur lors du calcul du landed cost import", e);
            throw new RuntimeException("Erreur lors du calcul du landed cost import: " + e.getMessage(), e);
        }
    }
    
    private BigDecimal calculateFretMaritime(ImportLandedCostDto dto) {
        // Calcul fret maritime sécurisé
        BigDecimal fretMaritime;
        try {
            // Protection contre null pour la valeur FOB
            BigDecimal valeurFob = dto.getValeurFob() != null ? dto.getValeurFob() : BigDecimal.ZERO;
            
            // Si valeur FOB est 0 ou négative, utiliser une valeur par défaut
            if (valeurFob.compareTo(BigDecimal.ZERO) <= 0) {
                logger.warn("Valeur FOB invalide: {}, utilisation d'une valeur par défaut", valeurFob);
                valeurFob = BigDecimal.valueOf(1000.00); // Valeur par défaut
            }
            
            // Calcul du fret (15% de la valeur FOB)
            BigDecimal tauxFret = BigDecimal.valueOf(0.15);
            fretMaritime = valeurFob.multiply(tauxFret).setScale(2, RoundingMode.HALF_UP);
            
            logger.info("Fret maritime calculé: {} (valeur FOB: {})", fretMaritime, valeurFob);
            
        } catch(Exception e) {
            logger.error("Erreur lors du calcul du fret maritime, utilisation du fallback", e);
            // Fallback : 15% de la valeur FOB ou valeur par défaut
            BigDecimal valeurFob = dto.getValeurFob() != null ? dto.getValeurFob() : BigDecimal.valueOf(1000.00);
            fretMaritime = valeurFob.multiply(BigDecimal.valueOf(0.15)).setScale(2, RoundingMode.HALF_UP);
        }

        // Protection finale contre null/NaN
        if (fretMaritime == null || fretMaritime.compareTo(BigDecimal.ZERO) <= 0) {
            logger.warn("Fret maritime invalide après calcul, utilisation du fallback final");
            BigDecimal valeurFob = dto.getValeurFob() != null ? dto.getValeurFob() : BigDecimal.valueOf(1000.00);
            fretMaritime = valeurFob.multiply(BigDecimal.valueOf(0.15)).setScale(2, RoundingMode.HALF_UP);
        }
        
        return fretMaritime;
    }
    
    private BigDecimal calculateDroitsDouaneImport(ImportLandedCostDto dto, BigDecimal valeurCif) {
        try {
            // Utiliser le service existant pour calculer les droits de douane
            // Pour l'instant, taux par défaut car la méthode spécifique n'existe pas encore
            BigDecimal tauxDroit = BigDecimal.valueOf(0.05); // 5% par défaut
            return valeurCif.multiply(tauxDroit).setScale(2, RoundingMode.HALF_UP);
        } catch (Exception e) {
            logger.warn("Erreur lors du calcul des droits de douane, utilisation du taux par défaut", e);
            return valeurCif.multiply(BigDecimal.valueOf(0.05)).setScale(2, RoundingMode.HALF_UP);
        }
    }
    
    private BigDecimal calculateTvaImport(BigDecimal valeurCif, BigDecimal droitsDouane, String paysDestination) {
        // TVA appliquée sur (valeur CIF + droits de douane)
        BigDecimal baseTva = valeurCif.add(droitsDouane);
        
        // Taux TVA par pays (simplifié)
        BigDecimal tauxTva = getTauxTvaByPays(paysDestination);
        
        return baseTva.multiply(tauxTva).setScale(2, RoundingMode.HALF_UP);
    }
    
    private BigDecimal getTauxTvaByPays(String pays) {
        if (pays == null || pays.trim().isEmpty()) {
            return BigDecimal.valueOf(0.20);
        }
        switch (pays.trim().toLowerCase()) {
            case "maroc":
                return BigDecimal.valueOf(0.20); // 20% TVA Maroc
            case "france":
                return BigDecimal.valueOf(0.20); // 20% TVA France
            case "espagne":
                return BigDecimal.valueOf(0.21); // 21% TVA Espagne
            case "allemagne":
                return BigDecimal.valueOf(0.19); // 19% TVA Allemagne
            case "italie":
                return BigDecimal.valueOf(0.22); // 22% TVA Italie
            case "belgique":
                return BigDecimal.valueOf(0.21); // 21% TVA Belgique
            case "pays-bas":
                return BigDecimal.valueOf(0.21); // 21% TVA Pays-Bas
            default:
                return BigDecimal.valueOf(0.20); // 20% par défaut
        }
    }
    
    private BigDecimal calculateFraisPortuairesDestination(ImportLandedCostDto dto) {
        // Frais portuaires fixes par port de déchargement
        // Pour l'instant, estimation simple
        return BigDecimal.valueOf(500.00); // 500 unités de devise par défaut
    }
    
    private BigDecimal calculateAutresFrais(ImportLandedCostDto dto, BigDecimal valeurCif) {
        // Autres frais: manutention, dédouanement, etc.
        // Estimation: 2% de la valeur CIF
        return valeurCif.multiply(BigDecimal.valueOf(0.02)).setScale(2, RoundingMode.HALF_UP);
    }
    
    private String generateReference() {
        String date = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String random = String.format("%04d", (int)(Math.random() * 10000));
        return "IMPORT-" + date + "-" + random;
    }
}
