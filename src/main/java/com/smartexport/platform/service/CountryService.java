package com.smartexport.platform.service;

import com.smartexport.platform.entity.Country;
import com.smartexport.platform.repository.CountryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.HashSet;

@Service
public class CountryService {
    
    private static final Logger log = 
        LoggerFactory.getLogger(CountryService.class);
    
    @Autowired
    private CountryRepository countryRepository;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Liste des pays maritimes (même ensemble que dans le frontend)
    private static final Set<String> MARITIME_COUNTRIES_ISO2_SET = Set.of(
        "MA", "FR", "ES", "PT", "IT", "GB", "NL", "BE", "DE", "US", "CA", 
        "BR", "AR", "TR", "EG", "ZA", "NG", "IN", "CN", "JP", "AU", "MX", 
        "KR", "SG", "MY", "TH", "VN", "PH", "ID", "CL", "PE", "CO", "VE", 
        "EC", "UY", "PY", "BO", "GY", "SR", "GF", "PF", "NC", "RE", "YT", 
        "KM", "SC", "MU", "MG", "MZ", "TZ", "KE", "SO", "DJ", "ER", "SD", 
        "LY", "TN", "DZ", "GH", "CI", "LR", "SL", "GN", "SN", "GM", "GW", 
        "CV", "ST", "AO", "NA", "BW", "ZW", "ZM", "MW", "UG", "RW", 
        "BI", "ET", "SS", "CF", "TD", "NE", "ML", "BF", "BJ", "TG", 
        "GA", "GQ", "CM", "CD", "CG", "EH", "MR"
    );
    
    public List<Country> getAll() {
        log.info("Récupération de tous les pays");
        List<Country> countries = countryRepository.findAll();
        log.info("Nombre de pays trouvés: {}", countries.size());
        return countries;
    }
    
    public List<Country> syncFromApi() {
        log.info("Synchronisation des pays depuis l'API REST Countries");
        try {
            // Nettoyer la table existante
            countryRepository.deleteAll();
            log.info("Table countries nettoyée");
            
            // Appeler l'API REST Countries
            String apiUrl = "https://restcountries.com/v3.1/all?fields=name,translations,cca2,flags,region,subregion,currencies";
            ResponseEntity<String> response = restTemplate.getForEntity(apiUrl, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                log.error("Erreur lors de l'appel à l'API REST Countries");
                return new ArrayList<>();
            }
            
            // Parser la réponse JSON
            JsonNode countries = objectMapper.readTree(response.getBody());
            List<Country> countryEntities = new ArrayList<>();
            
            for (JsonNode countryNode : countries) {
                try {
                    // Extraire le code ISO2
                    String iso2 = countryNode.path("cca2").asText();
                    if (iso2.isEmpty()) continue;
                    
                    // Filtrer uniquement les pays maritimes
                    if (!MARITIME_COUNTRIES_ISO2_SET.contains(iso2.toUpperCase())) {
                        continue;
                    }
                    
                    // Extraire le nom en français ou fallback vers l'anglais
                    String name = countryNode.path("translations").path("fra").path("common").asText();
                    if (name.isEmpty()) {
                        name = countryNode.path("name").path("common").asText();
                    }
                    if (name.isEmpty()) continue;
                    
                    // Créer l'entité Country
                    Country country = new Country();
                    country.setCode(iso2);
                    country.setName(name);
                    country.setRegion(countryNode.path("region").asText());
                    country.setSubregion(countryNode.path("subregion").asText());
                    
                    // Extraire la devise
                    JsonNode currencies = countryNode.path("currencies");
                    if (currencies != null && currencies.isObject() && currencies.size() > 0) {
                        String firstCurrencyKey = currencies.fieldNames().next();
                        country.setCurrency(firstCurrencyKey);
                    } else {
                        country.setCurrency("USD"); // Fallback
                    }
                    
                    // URL du drapeau
                    JsonNode flags = countryNode.path("flags");
                    if (flags != null) {
                        String flagUrl = flags.path("png").asText();
                        if (flagUrl.isEmpty()) {
                            flagUrl = flags.path("svg").asText();
                        }
                        country.setFlagUrl(flagUrl.isEmpty() ? null : flagUrl);
                    }
                    
                    // Valeurs par défaut pour les taux (pourront être modifiées plus tard)
                    country.setCustomsDutyRate(0.0);
                    country.setVatRate(20.0);
                    country.setParafiscalRate(0.0);
                    country.setPortFees(100.0);
                    
                    countryEntities.add(country);
                    
                } catch (Exception e) {
                    log.warn("Erreur lors du traitement d'un pays: {}", e.getMessage());
                }
            }
            
            // Sauvegarder tous les pays
            List<Country> savedCountries = countryRepository.saveAll(countryEntities);
            log.info("Nombre de pays synchronisés et sauvegardés: {}", savedCountries.size());
            
            return savedCountries;
            
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation des pays", e);
            return new ArrayList<>();
        }
    }
    
    public Country update(Long id, Country updates) {
        log.info("Mise à jour du pays avec ID: {}", id);
        // TODO: implémenter la mise à jour en base de données
        return updates;
    }
}
