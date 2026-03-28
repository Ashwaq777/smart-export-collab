package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.entity.ContRating;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.repository.ContRatingRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
@Transactional
public class RatingService {

    private final ContRatingRepository ratingRepository;
    private final ContainerTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public RatingService(ContRatingRepository ratingRepository, 
                        ContainerTransactionRepository transactionRepository,
                        UserRepository userRepository) {
        this.ratingRepository = ratingRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    public ContRating submitRating(Long transactionId, Long raterId, Integer score, String comment) {
        log.info("Submitting rating for transaction {} by user {} with score {}", transactionId, raterId, score);

        // Validation du score
        if (score < 1 || score > 5) {
            throw new IllegalArgumentException("Le score doit être entre 1 et 5");
        }

        // Récupération de la transaction
        ContainerTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));

        // Vérification que la transaction est COMPLETED
        if (transaction.getWorkflowStatus() != WorkflowStatus.COMPLETED) {
            throw new IllegalArgumentException("Seules les transactions terminées peuvent être notées");
        }

        // Récupération de l'utilisateur qui note
        User rater = userRepository.findById(raterId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification que l'utilisateur est bien provider ou seeker
        User rated = null;
        if (transaction.getMatch() != null) {
            if (transaction.getMatch().getOffer() != null && 
                transaction.getMatch().getOffer().getProvider() != null &&
                transaction.getMatch().getOffer().getProvider().getId().equals(raterId)) {
                // Le provider note le seeker
                if (transaction.getMatch().getRequest() != null && 
                    transaction.getMatch().getRequest().getSeeker() != null) {
                    rated = transaction.getMatch().getRequest().getSeeker();
                }
            } else if (transaction.getMatch().getRequest() != null && 
                       transaction.getMatch().getRequest().getSeeker() != null &&
                       transaction.getMatch().getRequest().getSeeker().getId().equals(raterId)) {
                // Le seeker note le provider
                if (transaction.getMatch().getOffer() != null && 
                    transaction.getMatch().getOffer().getProvider() != null) {
                    rated = transaction.getMatch().getOffer().getProvider();
                }
            }
        }

        if (rated == null) {
            throw new IllegalArgumentException("Vous n'êtes pas autorisé à noter cette transaction");
        }

        // Vérification qu'il n'a pas déjà noté
        if (ratingRepository.existsByTransactionIdAndRaterId(transactionId, raterId)) {
            throw new IllegalArgumentException("Vous avez déjà noté cette transaction");
        }

        // Création de la note
        ContRating rating = new ContRating();
        rating.setTransaction(transaction);
        rating.setRater(rater);
        rating.setRated(rated);
        rating.setScore(score);
        rating.setComment(comment);

        ContRating savedRating = ratingRepository.save(rating);
        log.info("Rating submitted successfully: {}", savedRating.getId());

        return savedRating;
    }

    public Map<String, Object> getAverageRating(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<ContRating> ratings = ratingRepository.findByRatedId(userId);
        
        if (ratings.isEmpty()) {
            Map<String, Object> stats = new HashMap<>();
            stats.put("averageScore", 0.0);
            stats.put("ratingCount", 0L);
            return stats;
        }

        double averageScore = ratings.stream()
            .mapToInt(ContRating::getScore)
            .average()
            .orElse(0.0);

        Map<String, Object> stats = new HashMap<>();
        stats.put("averageScore", averageScore);
        stats.put("ratingCount", (long) ratings.size());

        return stats;
    }

    public List<ContRating> getRatingsByTransaction(Long transactionId) {
        ContainerTransaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new RuntimeException("Transaction non trouvée"));

        return ratingRepository.findByTransactionId(transactionId);
    }
}
