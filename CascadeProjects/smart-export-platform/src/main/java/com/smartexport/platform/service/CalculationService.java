package com.smartexport.platform.service;

import com.smartexport.platform.dto.*;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.entity.SivPrice;
import com.smartexport.platform.entity.TarifDouanier;
import com.smartexport.platform.repository.PortRepository;
import com.smartexport.platform.repository.SivPriceRepository;
import com.smartexport.platform.repository.TarifDouanierRepository;
import com.smartexport.platform.util.HsCodeUtil;
import com.smartexport.platform.util.FallbackTariffs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CalculationService {
    
    private final TarifDouanierRepository tarifRepository;
    private final SivPriceRepository sivPriceRepository;
    private final ExchangeRateService exchangeRateService;
    private final PortRepository portRepository;
    
    @Transactional(readOnly = true)
    public LandedCostResultDto calculateLandedCost(LandedCostCalculationDto request) {
        // Generate unique simulation ID
        String simulationId = generateSimulationId();
        String normalizedCodeHs = HsCodeUtil.normalize(request.getCodeHs());
        
        // Apply Incoterms logic
        BigDecimal assuranceAjustee = applyIncotermsLogic(request);
        
        // Try to get tariff from database, fallback to WTO MFN rates if not found
        TarifDouanier tarif = null;
        String dataSource = "DATABASE";
        String warningMessage = null;
        
        try {
            tarif = tarifRepository.findByCodeHsAndPaysDestination(
                normalizedCodeHs, 
                request.getPaysDestination()
            ).orElse(null);
            
            if (tarif == null) {
                // Use WTO MFN fallback rates
                log.warn("No tariff data found for HS {} and country {}. Using WTO MFN fallback rates.", 
                    request.getCodeHs(), request.getPaysDestination());
                dataSource = "WTO_MFN_ESTIMATED";
                warningMessage = FallbackTariffs.getFallbackWarning(request.getPaysDestination());
                
                // Create virtual tariff object with WTO MFN rates
                tarif = new TarifDouanier();
                tarif.setCodeHs(normalizedCodeHs);
                tarif.setPaysDestination(request.getPaysDestination());
                tarif.setNomProduit("Produit HS " + request.getCodeHs());
                tarif.setTauxDouane(FallbackTariffs.getTariffRateWithPreferences(normalizedCodeHs, request.getPaysDestination()));
                tarif.setTauxTva(FallbackTariffs.getVATRate(request.getPaysDestination()));
                tarif.setTaxeParafiscale(BigDecimal.ZERO);
            }
        } catch (Exception e) {
            // Even if database query fails, use fallback
            log.error("Error querying tariff database: {}. Using WTO MFN fallback rates.", e.getMessage());
            dataSource = "FALLBACK_ESTIMATED";
            warningMessage = FallbackTariffs.getFallbackWarning(request.getPaysDestination());
            
            tarif = new TarifDouanier();
            tarif.setCodeHs(normalizedCodeHs);
            tarif.setPaysDestination(request.getPaysDestination());
            tarif.setNomProduit("Produit HS " + request.getCodeHs());
            tarif.setTauxDouane(FallbackTariffs.getWTOMFNRate(normalizedCodeHs));
            tarif.setTauxTva(FallbackTariffs.getVATRate(request.getPaysDestination()));
            tarif.setTaxeParafiscale(BigDecimal.ZERO);
        }
        
        BigDecimal valeurCaf = request.getValeurFob()
            .add(request.getCoutTransport())
            .add(assuranceAjustee);
        
        BigDecimal montantDouane = valeurCaf
            .multiply(tarif.getTauxDouane())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        BigDecimal baseCalculTva = valeurCaf.add(montantDouane);
        BigDecimal montantTva = baseCalculTva
            .multiply(tarif.getTauxTva())
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        // Apply Moroccan parafiscal tax for HS 070200
        BigDecimal tauxParafiscaleEffectif = tarif.getTaxeParafiscale() != null 
            ? tarif.getTaxeParafiscale() 
            : BigDecimal.ZERO;
        if ("070200".equals(normalizedCodeHs) || "0702.00".equals(normalizedCodeHs)) {
            tauxParafiscaleEffectif = tauxParafiscaleEffectif.add(BigDecimal.valueOf(0.25));
        }
        
        BigDecimal montantTaxeParafiscale = valeurCaf
            .multiply(tauxParafiscaleEffectif)
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        
        Port port = null;
        BigDecimal fraisPortuaires = BigDecimal.ZERO;
        String nomPort = null;
        
        if (request.getPortId() != null) {
            port = portRepository.findById(request.getPortId()).orElse(null);
            if (port != null) {
                fraisPortuaires = port.getFraisPortuaires() != null ? port.getFraisPortuaires() : BigDecimal.ZERO;
                nomPort = port.getNomPort();
            }
        }
        
        BigDecimal coutTotal = valeurCaf
            .add(montantDouane)
            .add(montantTva)
            .add(montantTaxeParafiscale)
            .add(fraisPortuaires);
        
        // Profitability calculation
        BigDecimal margeNette = null;
        BigDecimal margePourcentage = null;
        String indicateurRentabilite = null;
        
        if (request.getPrixVentePrevisionnel() != null) {
            margeNette = request.getPrixVentePrevisionnel().subtract(coutTotal);
            if (coutTotal.compareTo(BigDecimal.ZERO) > 0) {
                margePourcentage = margeNette
                    .multiply(BigDecimal.valueOf(100))
                    .divide(coutTotal, 2, RoundingMode.HALF_UP);
            }
            indicateurRentabilite = margeNette.compareTo(BigDecimal.ZERO) > 0 ? "POSITIF" : 
                                   margeNette.compareTo(BigDecimal.ZERO) < 0 ? "NEGATIF" : "NEUTRE";
        }
        
        // SIV Algorithm
        Boolean alerteSiv = false;
        String messageSiv = null;
        BigDecimal prixEntreeSivMin = null;
        
        SivPrice sivPrice = sivPriceRepository.findByCodeHsAndRegion(normalizedCodeHs, "EU").orElse(null);
        if (sivPrice != null) {
            prixEntreeSivMin = sivPrice.getMinEntryPrice();
            if (valeurCaf.compareTo(prixEntreeSivMin) < 0) {
                alerteSiv = true;
                messageSiv = "⚠️ ALERTE SIV: Valeur CAF inférieure au prix d'entrée UE. Risque de taxes compensatoires.";
            }
        }
        
        // Currency sensitivity analysis (+/- 2%)
        BigDecimal impactDevise2PourcentPlus = null;
        BigDecimal impactDevise2PourcentMoins = null;
        
        if (coutTotal != null) {
            impactDevise2PourcentPlus = coutTotal.multiply(BigDecimal.valueOf(0.02));
            impactDevise2PourcentMoins = coutTotal.multiply(BigDecimal.valueOf(-0.02));
        }
        
        BigDecimal coutEstime = request.getValeurFob()
            .multiply(BigDecimal.valueOf(1.15));
        
        BigDecimal varianceCout = coutTotal.subtract(coutEstime);
        
        String variancePercentage = coutEstime.compareTo(BigDecimal.ZERO) > 0
            ? varianceCout.multiply(BigDecimal.valueOf(100))
                .divide(coutEstime, 2, RoundingMode.HALF_UP) + "%"
            : "N/A";
        
        String currency = request.getCurrency() != null ? request.getCurrency() : "MAD";
        BigDecimal coutTotalEur = null;
        BigDecimal coutTotalUsd = null;
        
        if (!"EUR".equals(currency)) {
            try {
                ForexConversionDto conversionEur = exchangeRateService.convert(coutTotal, currency, "EUR");
                if (conversionEur != null) {
                    coutTotalEur = conversionEur.getConvertedAmount();
                }
            } catch (Exception e) {
                log.warn("Failed to convert to EUR: {}", e.getMessage());
                coutTotalEur = null;
            }
        }
        
        if (!"USD".equals(currency)) {
            try {
                ForexConversionDto conversionUsd = exchangeRateService.convert(coutTotal, currency, "USD");
                if (conversionUsd != null) {
                    coutTotalUsd = conversionUsd.getConvertedAmount();
                }
            } catch (Exception e) {
                log.warn("Failed to convert to USD: {}", e.getMessage());
                coutTotalUsd = null;
            }
        }
        
        return LandedCostResultDto.builder()
            .simulationId(simulationId)
            .codeHs(tarif.getCodeHs())
            .nomProduit(tarif.getNomProduit())
            .paysDestination(tarif.getPaysDestination())
            .valeurFob(request.getValeurFob())
            .coutTransport(request.getCoutTransport())
            .assurance(assuranceAjustee)
            .valeurCaf(valeurCaf)
            .tauxDouane(tarif.getTauxDouane())
            .montantDouane(montantDouane)
            .tauxTva(tarif.getTauxTva())
            .montantTva(montantTva)
            .taxeParafiscale(tauxParafiscaleEffectif)
            .montantTaxeParafiscale(montantTaxeParafiscale)
            .nomPort(nomPort)
            .fraisPortuaires(fraisPortuaires)
            .coutTotal(coutTotal)
            .coutEstime(coutEstime)
            .varianceCout(varianceCout)
            .variancePercentage(variancePercentage)
            .currency(currency)
            .coutTotalEur(coutTotalEur)
            .coutTotalUsd(coutTotalUsd)
            .nomEntreprise(request.getNomEntreprise())
            .registreCommerce(request.getRegistreCommerce())
            .ice(request.getIce())
            .prixVentePrevisionnel(request.getPrixVentePrevisionnel())
            .margeNette(margeNette)
            .margePourcentage(margePourcentage)
            .indicateurRentabilite(indicateurRentabilite)
            .alerteSiv(alerteSiv)
            .messageSiv(messageSiv)
            .prixEntreeSivMin(prixEntreeSivMin)
            .impactDevise2PourcentPlus(impactDevise2PourcentPlus)
            .impactDevise2PourcentMoins(impactDevise2PourcentMoins)
            .poidsNet(request.getPoidsNet())
            .poidsBrut(request.getPoidsBrut())
            .typeUnite(request.getTypeUnite())
            .incoterm(request.getIncoterm())
            .dataSource(dataSource)
            .warningMessage(warningMessage)
            .disclaimer("Estimation basée sur flux réels et tarifs officiels en vigueur au 20/02/2026.")
            .exchangeRateSource("ExchangeRate-API")
            .calculationDate(LocalDateTime.now())
            .build();
    }
    
    public AlerteSeuilDto verifierSeuilEps(String codeHs, BigDecimal valeurSaisie) {
        String normalizedCodeHs = HsCodeUtil.normalize(codeHs);
        
        TarifDouanier tarif = tarifRepository.findByCodeHsAndPaysDestination(normalizedCodeHs, "France")
            .orElse(null);
        
        if (tarif == null) {
            return AlerteSeuilDto.builder()
                .codeHs(codeHs)
                .valeurSaisie(valeurSaisie)
                .alerteActive(false)
                .message("Aucune donnée de référence disponible")
                .build();
        }
        
        SivPrice sivPrice = sivPriceRepository.findByCodeHsAndRegion(normalizedCodeHs, "EU")
            .orElse(null);
        
        BigDecimal prixSivMin;
        BigDecimal prixSivMax;
        
        if (sivPrice != null) {
            prixSivMin = sivPrice.getMinEntryPrice();
            prixSivMax = sivPrice.getMinEntryPrice().multiply(BigDecimal.valueOf(5));
        } else {
            prixSivMin = BigDecimal.valueOf(100);
            prixSivMax = BigDecimal.valueOf(500);
        }
        
        boolean alerteActive = valeurSaisie.compareTo(prixSivMin) < 0;
        String typeAlerte = alerteActive ? "DUMPING_SUSPECT" : "NORMAL";
        String message = alerteActive 
            ? "⚠️ ALERTE: Prix inférieur au seuil SIV. Risque de taxe compensatoire."
            : "✓ Prix conforme aux prix d'entrée du marché européen";
        
        BigDecimal tauxCompensatoire = alerteActive 
            ? BigDecimal.valueOf(15.00)
            : BigDecimal.ZERO;
        
        return AlerteSeuilDto.builder()
            .codeHs(codeHs)
            .nomProduit(tarif.getNomProduit())
            .valeurSaisie(valeurSaisie)
            .prixEntreeSivMin(prixSivMin)
            .prixEntreeSivMax(prixSivMax)
            .alerteActive(alerteActive)
            .typeAlerte(typeAlerte)
            .message(message)
            .tauxCompensatoire(tauxCompensatoire)
            .build();
    }
    
    public RisqueChangeDto calculerRisqueChange(
            String deviseSource, 
            String deviseCible, 
            BigDecimal tauxActuel, 
            BigDecimal montantInitial) {
        
        BigDecimal variationUnPourcent = tauxActuel
            .multiply(BigDecimal.valueOf(0.01));
        
        BigDecimal sensibilite = montantInitial
            .multiply(variationUnPourcent)
            .divide(tauxActuel, 2, RoundingMode.HALF_UP);
        
        BigDecimal impactMarge = sensibilite
            .multiply(BigDecimal.valueOf(100))
            .divide(montantInitial, 2, RoundingMode.HALF_UP);
        
        String indicateur;
        String recommandation;
        
        if (impactMarge.abs().compareTo(BigDecimal.valueOf(2)) > 0) {
            indicateur = "ÉLEVÉ";
            recommandation = "Envisager une couverture de change (forward/option)";
        } else if (impactMarge.abs().compareTo(BigDecimal.valueOf(1)) > 0) {
            indicateur = "MODÉRÉ";
            recommandation = "Surveiller l'évolution du taux de change";
        } else {
            indicateur = "FAIBLE";
            recommandation = "Risque acceptable, pas d'action immédiate requise";
        }
        
        return RisqueChangeDto.builder()
            .deviseSource(deviseSource)
            .deviseCible(deviseCible)
            .tauxActuel(tauxActuel)
            .montantInitial(montantInitial)
            .sensibilite1Pourcent(sensibilite)
            .impactMarge1Pourcent(impactMarge)
            .indicateurRisque(indicateur)
            .recommandation(recommandation)
            .sourceData("ExchangeRate-API (estimation)")
            .build();
    }
    
    private String generateSimulationId() {
        return "SIM-" + System.currentTimeMillis() + "-" + 
               String.format("%04d", (int)(Math.random() * 10000));
    }
    
    private BigDecimal applyIncotermsLogic(LandedCostCalculationDto request) {
        String incoterm = request.getIncoterm();
        if (incoterm == null) {
            return request.getAssurance();
        }
        
        switch (incoterm.toUpperCase()) {
            case "FOB":
                // FOB: no insurance included
                return BigDecimal.ZERO;
            case "CIF":
                // CIF: include insurance (100 MAD default if not specified)
                return request.getAssurance() != null && request.getAssurance().compareTo(BigDecimal.ZERO) > 0 
                    ? request.getAssurance() 
                    : BigDecimal.valueOf(100);
            default:
                return request.getAssurance();
        }
    }
}
