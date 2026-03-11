package com.smartexport.platform.service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.smartexport.platform.entity.ReglementationConfig;
import com.smartexport.platform.repository.ReglementationConfigRepository;

@Service
public class ReglementationService {

    private final ReglementationConfigRepository reglementationRepository;

    public ReglementationService(ReglementationConfigRepository reglementationRepository) {
        this.reglementationRepository = reglementationRepository;
    }

    public List<ReglementationConfig> getAllActiveReglementations() {
        return reglementationRepository.findByActifOrderByZoneAscPaysAsc(true);
    }

    public List<ReglementationConfig> getReglementationsByZone(String zone) {
        return reglementationRepository.findByZoneAndActifOrderByPaysAsc(zone, true);
    }

    public List<String> getAllZones() {
        return reglementationRepository.findDistinctZones();
    }

    public ReglementationConfig getReglementationByCode(String code) {
        return reglementationRepository.findByCodeAndActif(code, true);
    }

    public List<ReglementationConfig> searchReglementations(String searchTerm) {
        return reglementationRepository.searchByTerm(searchTerm);
    }

    public Map<String, List<ReglementationConfig>> getReglementationsGroupedByZone() {
        Map<String, List<ReglementationConfig>> grouped = new HashMap<>();
        
        List<ReglementationConfig> allRegulations = getAllActiveReglementations();
        
        for (ReglementationConfig reg : allRegulations) {
            String zone = reg.getZone();
            grouped.computeIfAbsent(zone, k -> new java.util.ArrayList<>()).add(reg);
        }
        
        return grouped;
    }

    public void initializeReglementations() {
        // Vérifier si des réglementations existent déjà
        if (reglementationRepository.count() > 0) {
            return;
        }

        // AMÉRIQUES
        createReglementation("FSMA_204", "FSMA 204 (Food Safety Modernization Act)", "AMÉRIQUES", 
            "USA", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination", 
            "nomExpediteur", "dateExpedition", "nomDestinataire", "dateReception"),
            "Loi américaine sur la modernisation de la sécurité alimentaire - exigences de traçabilité complètes");

        createReglementation("COOL", "COOL (Country of Origin Labeling)", "AMÉRIQUES", 
            "USA", Arrays.asList("paysOrigine", "producteur", "dateRecolte"),
            "Étiquetage du pays d'origine pour les produits agricoles");

        createReglementation("SFCA", "SFCA (Safe Food for Canadians Act)", "AMÉRIQUES", 
            "Canada", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Loi canadienne sur la salubrité des aliments");

        createReglementation("NOM_251", "NOM-251 (Norma Oficial Mexicana)", "AMÉRIQUES", 
            "Mexique", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte"),
            "Norme officielle mexicaine pour la traçabilité des produits");

        createReglementation("RDC_275", "RDC 275 (ANVISA Brésil)", "AMÉRIQUES", 
            "Brésil", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Réglementation brésilienne pour la traçabilité des produits alimentaires");

        // EUROPE
        createReglementation("UE_178_2002", "Règlement UE 178/2002", "EUROPE", 
            "Union Européenne", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "operateurUE", "numeroEori"),
            "Règlement général sur la traçabilité dans l'Union Européenne");

        createReglementation("UE_2017_625", "Règlement UE 2017/625", "EUROPE", 
            "Union Européenne", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "typeDocument", "numeroDocument"),
            "Contrôles officiels et traçabilité des produits dans l'UE");

        createReglementation("UE_931_2011", "Règlement UE 931/2011", "EUROPE", 
            "Union Européenne", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "certificatSanitaire", "operateurUE"),
            "Règlement spécifique aux produits d'origine animale");

        createReglementation("UK_HRFSS", "UK HRFSS (post-Brexit)", "EUROPE", 
            "Royaume-Uni", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "nomExpediteur"),
            "Réglementation britannique sur l'hygiène alimentaire et la sécurité");

        // ASIE
        createReglementation("GB_2763", "GB 2763 (Chine)", "ASIE", 
            "Chine", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Norme chinoise sur les résidus de pesticides et traçabilité");

        createReglementation("JAPAN_FSA", "Food Safety Basic Act (Japon)", "ASIE", 
            "Japon", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "certificatSanitaire"),
            "Loi japonaise sur la sécurité alimentaire de base");

        createReglementation("FSSAI", "FSSAI (Inde)", "ASIE", 
            "Inde", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Autorité indienne pour la sécurité des aliments et normes");

        createReglementation("KOREA_SPS", "SPS Measures (Corée du Sud)", "ASIE", 
            "Corée du Sud", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "certificatSanitaire"),
            "Mesures sanitaires et phytosanitaires coréennes");

        createReglementation("THAILAND_ACT", "Food Act B.E. 2522 (Thaïlande)", "ASIE", 
            "Thaïlande", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte"),
            "Loi thaïlandaise sur les aliments");

        // MOYEN-ORIENT
        createReglementation("GSO", "GSO (Conseil de Coopération du Golfe)", "MOYEN-ORIENT", 
            "Golfe", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Normes du Conseil de coopération du Golfe");

        createReglementation("SFDA", "SFDA (Arabie Saoudite)", "MOYEN-ORIENT", 
            "Arabie Saoudite", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "certificatSanitaire"),
            "Autorité saoudienne pour la sécurité alimentaire");

        createReglementation("ESMA", "ESMA (Émirats Arabes Unis)", "MOYEN-ORIENT", 
            "Émirats Arabes Unis", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination"),
            "Autorité émiratie pour la normalisation et la métrologie");

        // AFRIQUE
        createReglementation("ARSO", "ARSO (African Regional Standards)", "AFRIQUE", 
            "Afrique", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Organisation africaine de normalisation régionale");

        createReglementation("ARS_855", "ARS 855 (Afrique du Sud)", "AFRIQUE", 
            "Afrique du Sud", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", 
            "destination", "certificatSanitaire"),
            "Norme sud-africaine pour la traçabilité des produits agricoles");

        createReglementation("NAFDAC", "NAFDAC (Nigéria)", "AFRIQUE", 
            "Nigéria", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Agence nigériane de contrôle des aliments et médicaments");

        createReglementation("KEBS", "KEBS (Kenya)", "AFRIQUE", 
            "Kenya", Arrays.asList("traceabilityLotCode", "producteur", "dateRecolte", "destination"),
            "Office kényan des normes");

        // OCÉANIE
        createReglementation("FSANZ", "FSANZ (Australie/Nouvelle-Zélande)", "OCÉANIE", 
            "Australie/Nouvelle-Zélande", Arrays.asList("traceabilityLotCode", "producteur", 
            "dateRecolte", "destination", "certificatSanitaire"),
            "Autorité australienne et néo-zélandaise pour la sécurité des aliments");
    }

    private void createReglementation(String code, String nom, String zone, String pays, 
                                    List<String> champsObligatoires, String description) {
        ReglementationConfig reg = new ReglementationConfig(code, nom, zone, pays, 
            champsObligatoires, description);
        reglementationRepository.save(reg);
    }

    public boolean validateChampsObligatoires(String reglementationCode, Map<String, Object> formData) {
        ReglementationConfig reg = getReglementationByCode(reglementationCode);
        if (reg == null) {
            return false;
        }

        List<String> champsRequis = reg.getChampsObligatoires();
        if (champsRequis == null || champsRequis.isEmpty()) {
            return true;
        }

        for (String champ : champsRequis) {
            Object value = formData.get(champ);
            if (value == null || (value instanceof String && ((String) value).trim().isEmpty())) {
                return false;
            }
        }

        return true;
    }

    public List<String> getChampsManquants(String reglementationCode, Map<String, Object> formData) {
        ReglementationConfig reg = getReglementationByCode(reglementationCode);
        if (reg == null || reg.getChampsObligatoires() == null) {
            return Arrays.asList();
        }

        return reg.getChampsObligatoires().stream()
            .filter(champ -> {
                Object value = formData.get(champ);
                return value == null || (value instanceof String && ((String) value).trim().isEmpty());
            })
            .toList();
    }
}
