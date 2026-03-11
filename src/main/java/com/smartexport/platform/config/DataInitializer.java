package com.smartexport.platform.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.smartexport.platform.service.ReglementationService;

@Component
public class DataInitializer implements CommandLineRunner {

    private final ReglementationService reglementationService;

    public DataInitializer(ReglementationService reglementationService) {
        this.reglementationService = reglementationService;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Initialiser les réglementations au démarrage de l'application
        try {
            reglementationService.initializeReglementations();
            System.out.println("✅ Réglementations initialisées avec succès");
        } catch (Exception e) {
            System.err.println("❌ Erreur lors de l'initialisation des réglementations: " + e.getMessage());
            // Ne pas arrêter l'application si l'initialisation échoue
        }
    }
}
