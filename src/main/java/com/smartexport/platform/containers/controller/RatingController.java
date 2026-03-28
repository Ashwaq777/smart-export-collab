package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.entity.ContRating;
import com.smartexport.platform.containers.service.RatingService;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ratings")
@Slf4j
public class RatingController {

    private final RatingService ratingService;
    private final UserRepository userRepository;

    public RatingController(RatingService ratingService, UserRepository userRepository) {
        this.ratingService = ratingService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<?> createRating(
            @RequestBody Map<String, Object> ratingData,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            
            // Récupérer l'ID réel de l'utilisateur depuis son email
            User rater = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
            Long raterId = rater.getId();
            
            Long transactionId = Long.valueOf(ratingData.get("transactionId").toString());
            Integer score = Integer.valueOf(ratingData.get("score").toString());
            String comment = ratingData.get("comment") != null ? ratingData.get("comment").toString() : null;
            
            ContRating rating = ratingService.submitRating(transactionId, raterId, score, comment);
            
            Map<String, Object> response = Map.of(
                "message", "Note enregistrée avec succès",
                "ratingId", rating.getId()
            );
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Invalid rating request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating rating", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de l'enregistrement de la note"));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserRatingStats(@PathVariable Long userId) {
        try {
            Map<String, Object> stats = ratingService.getAverageRating(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching user rating stats", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de la récupération des statistiques"));
        }
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getTransactionRatings(@PathVariable Long transactionId) {
        try {
            List<ContRating> ratings = ratingService.getRatingsByTransaction(transactionId);
            return ResponseEntity.ok(ratings);
        } catch (Exception e) {
            log.error("Error fetching transaction ratings", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de la récupération des notes"));
        }
    }
}
