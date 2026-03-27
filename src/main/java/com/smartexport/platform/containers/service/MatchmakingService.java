package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerMatchDTO;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.notification.PushNotificationService;
import com.smartexport.platform.notification.dto.NotificationPayload;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

// Helper class for match results
class ContainerMatchResult {
    double score;
    double distance;
    
    ContainerMatchResult(double s, double d) {
        score = s;
        distance = d;
    }
}

@Service
@Slf4j
public class MatchmakingService {

    private static final double MAX_DISTANCE_KM = 10000.0;

    private final ContainerRequestRepository requestRepository;
    private final ContainerOfferRepository offerRepository;
    private final ContainerMatchRepository matchRepository;
    private final ContainerEmailService emailService;
    private final PushNotificationService pushNotificationService;

    public MatchmakingService(ContainerRequestRepository requestRepository,
                              ContainerOfferRepository offerRepository,
                              ContainerMatchRepository matchRepository,
                              ContainerEmailService emailService,
                              PushNotificationService pushNotificationService) {
        this.requestRepository = requestRepository;
        this.offerRepository = offerRepository;
        this.matchRepository = matchRepository;
        this.emailService = emailService;
        this.pushNotificationService = pushNotificationService;
    }

    public List<ContainerMatchDTO> findMatches(Long requestId) {

        ContainerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Request not found: " + requestId));

        log.info("=== MATCHMAKING DEBUG START ===");
        log.info("Request ID: {}", requestId);
        log.info("Request containerType: {}", request.getContainerType());
        log.info("Request cargoType: {}", request.getCargoType());
        log.info("Request loadingLocation: {}", request.getLoadingLocation());
        log.info("Request coordinates: lat={}, lon={}", 
            request.getLoadingLatitude(), request.getLoadingLongitude());
        log.info("Request requiredDate: {}", request.getRequiredDate());
        log.info("Request seeker ID: {}", request.getSeeker().getId());

        // Get ALL available offers except seeker's own
        List<ContainerOffer> allOffers = offerRepository.findAll();
        log.info("Total offers in database: {}", allOffers.size());
        
        List<ContainerOffer> availableOffers = allOffers.stream()
              .filter(o -> {
                  boolean statusMatch = ContainerOfferStatus.AVAILABLE.equals(o.getStatus());
                  log.debug("Offer ID {} - status: {} -> matches AVAILABLE: {}", 
                      o.getId(), o.getStatus(), statusMatch);
                  return statusMatch;
              })
              .filter(o -> {
                  boolean notOwnOffer = !o.getProvider().getId().equals(request.getSeeker().getId());
                  log.debug("Offer ID {} - provider ID: {} vs seeker ID: {} -> not own: {}", 
                      o.getId(), o.getProvider().getId(), request.getSeeker().getId(), notOwnOffer);
                  return notOwnOffer;
              })
              .filter(o -> {
                  boolean hasCoordinates = o.getLatitude() != null && o.getLongitude() != null;
                  log.debug("Offer ID {} - coordinates: lat={}, lon={} -> has coords: {}", 
                      o.getId(), o.getLatitude(), o.getLongitude(), hasCoordinates);
                  return hasCoordinates;
              })
              .collect(Collectors.toList());

        log.info("Available offers after filtering: {}", availableOffers.size());

        List<ContainerMatch> matches = new ArrayList<>();

        for (ContainerOffer offer : availableOffers) {
            log.info("=== TESTING OFFER {} ===", offer.getId());
            log.info("Offer containerType: {}", offer.getContainerType());
            log.info("Offer cargoType: {}", offer.getCargoType());
            log.info("Offer location: {}", offer.getLocation());
            log.info("Offer coordinates: lat={}, lon={}", 
                offer.getLatitude(), offer.getLongitude());
            log.info("Offer availableDate: {}", offer.getAvailableDate());
            log.info("Offer provider ID: {}", offer.getProvider().getId());
            
            ContainerMatchResult result = 
                calculateScore(offer, request);
            
            if (result == null) {
                log.warn("Offer {} REJECTED - incompatible", offer.getId());
                continue; // incompatible
            }

            log.info("Offer {} ACCEPTED - score: {}, distance: {}km", 
                offer.getId(), result.score, result.distance);

            // Check if match already exists
            boolean exists = matchRepository
              .findByOfferId(offer.getId())
              .stream()
              .anyMatch(m -> m.getRequest().getId()
                .equals(requestId));
            
            log.debug("Match already exists for offer {}: {}", offer.getId(), exists);
            
            if (!exists) {
                ContainerMatch match = new ContainerMatch();
                match.setOffer(offer);
                match.setRequest(request);
                match.setDistanceKm(result.distance);
                match.setCompatibilityScore(result.score);
                match.setStatus(ContainerMatchStatus.PENDING);
                matches.add(matchRepository.save(match));
                log.info("Created new match {} for offer {}", match.getId(), offer.getId());
            }
        }

        // Sort by score descending — best match first
        matches.sort((a, b) -> Double.compare(
            b.getCompatibilityScore(),
            a.getCompatibilityScore()));

        // Return top 5 matches max
        List<ContainerMatch> topMatches = matches.stream()
            .limit(5)
            .collect(Collectors.toList());

        log.info("=== MATCHMAKING SUMMARY ===");
        log.info("Total matches created: {}", matches.size());
        log.info("Top 5 matches returned: {}", topMatches.size());
        for (ContainerMatch match : topMatches) {
            log.info("Match {} - Offer {} - Score: {}/100 - Distance: {}km", 
                match.getId(), match.getOffer().getId(), 
                match.getCompatibilityScore(), match.getDistanceKm());
        }
        log.info("=== MATCHMAKING DEBUG END ===");

        // Send notifications for new matches
        for (ContainerMatch match : topMatches) {
            try {
                emailService.sendMatchFoundEmail(match);
                
                // Push notification to provider
                pushNotificationService.notifyUser(
                    match.getOffer().getProvider().getEmail(),
                    NotificationPayload.matchFound(
                        match.getId(),
                        match.getOffer().getContainerType().toString(),
                        match.getOffer().getLocation()));

                // Push notification to seeker
                pushNotificationService.notifyUser(
                    match.getRequest().getSeeker().getEmail(),
                    NotificationPayload.matchFound(
                        match.getId(),
                        match.getOffer().getContainerType().toString(),
                        match.getOffer().getLocation()));
                        
            } catch (Exception e) {
                log.warn("Notification failed for match {}: {}", 
                    match.getId(), e.getMessage());
            }
        }

        return topMatches.stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private ContainerMatchResult calculateScore(
        ContainerOffer offer, 
        ContainerRequest request) {

      log.debug("=== CALCULATING SCORE FOR OFFER {} ===", offer.getId());

      // ELIMINATOIRE — type must match exactly
      log.debug("Container type check: offer={} vs request={}", 
          offer.getContainerType(), request.getContainerType());
      if (offer.getContainerType() == null || request.getContainerType() == null) {
          log.warn("NULL container type - offer: {}, request: {}", 
              offer.getContainerType(), request.getContainerType());
          return null;
      }
      if (!offer.getContainerType()
          .equals(request.getContainerType())) {
        log.warn("CONTAINER TYPE MISMATCH - offer: {} vs request: {}", 
            offer.getContainerType(), request.getContainerType());
        return null; // incompatible
      }
      log.debug("✓ Container type MATCH");

      double score = 0.0;

      // 1. CARGO TYPE (30 points)
      // Exact match = 30pts
      // Compatible match = 15pts (ex: DRY can carry GENERAL)
      // Incompatible = 0pts (eliminatoire si DANGEROUS/REEFER)
      log.debug("Cargo type check: offer={} vs request={}", 
          offer.getCargoType(), request.getCargoType());
      if (offer.getCargoType() != null 
          && request.getCargoType() != null) {
        if (offer.getCargoType()
            .equals(request.getCargoType())) {
          score += 30;
          log.debug("✓ Cargo type EXACT MATCH +30pts");
        } else {
          // Check if cargo types are incompatible
          boolean offerIsSpecial = 
            CargoType.DANGEROUS.equals(offer.getCargoType()) ||
            CargoType.REEFER.equals(offer.getCargoType());
          boolean reqIsSpecial = 
            CargoType.DANGEROUS.equals(request.getCargoType()) ||
            CargoType.REEFER.equals(request.getCargoType());
          
          log.debug("Special cargo check - offer special: {}, request special: {}", 
              offerIsSpecial, reqIsSpecial);
          
          // If one is special and doesn't match — skip
          if (offerIsSpecial || reqIsSpecial) {
            log.warn("INCOMPATIBLE CARGO TYPES - special cargo mismatch");
            return null; // incompatible
          }
          // Both are DRY/GENERAL — partial match
          score += 15;
          log.debug("✓ Cargo type PARTIAL MATCH +15pts");
        }
      } else {
        score += 15; // cargo not specified — neutral
        log.debug("✓ Cargo type not specified +15pts (neutral)");
      }

      // 2. GEOGRAPHIC PROXIMITY (40 points)
      // Use Haversine distance
      log.debug("Distance calculation: offer lat={},lon={} vs request lat={},lon={}", 
          offer.getLatitude(), offer.getLongitude(),
          request.getLoadingLatitude(), request.getLoadingLongitude());
          
      if (offer.getLatitude() == null || offer.getLongitude() == null ||
          request.getLoadingLatitude() == null || request.getLoadingLongitude() == null) {
          log.warn("NULL coordinates detected - cannot calculate distance");
          return null;
      }
          
      double distance = haversineKm(
        offer.getLatitude(), offer.getLongitude(),
        request.getLoadingLatitude(),
        request.getLoadingLongitude());

      log.debug("Calculated distance: {}km", distance);

      double distanceScore;
      if (distance <= 100) distanceScore = 40;
      else if (distance <= 500) distanceScore = 35;
      else if (distance <= 1000) distanceScore = 25;
      else if (distance <= 2000) distanceScore = 15;
      else if (distance <= 5000) distanceScore = 8;
      else distanceScore = 3; // long distance possible

      score += distanceScore;
      log.debug("✓ Distance score: +{}pts (total: {})", distanceScore, score);

      // 3. DATE AVAILABILITY (30 points)
      // Offer must be available BEFORE required date
      log.debug("Date check: offer available={} vs request required={}", 
          offer.getAvailableDate(), request.getRequiredDate());
      if (offer.getAvailableDate() != null 
          && request.getRequiredDate() != null) {
        long daysDiff = java.time.temporal.ChronoUnit.DAYS
          .between(offer.getAvailableDate(),
                   request.getRequiredDate());
        
        log.debug("Days difference: {} (offer should be BEFORE request)", daysDiff);
        
        if (daysDiff < 0) {
          log.warn("DATE INCOMPATIBLE - offer available AFTER required date");
          return null; // offer available AFTER required date
        } else if (daysDiff >= 30) {
          score += 30; // plenty of time
          log.debug("✓ Date compatibility +30pts (plenty of time)");
        } else if (daysDiff >= 14) {
          score += 25; // 2 weeks notice
          log.debug("✓ Date compatibility +25pts (2 weeks notice)");
        } else if (daysDiff >= 7) {
          score += 15; // 1 week notice
          log.debug("✓ Date compatibility +15pts (1 week notice)");
        } else {
          score += 5; // very tight timeline
          log.debug("✓ Date compatibility +5pts (very tight)");
        }
      } else {
        score += 15; // dates not specified
        log.debug("✓ Date not specified +15pts (neutral)");
      }

      log.debug("Final score: {}/100", score);

      // Minimum threshold: 40/100
      if (score < 40) {
        log.warn("SCORE TOO LOW: {}/100 (minimum 40 required)", score);
        return null;
      }

      log.info("✓ OFFER {} ACCEPTED - final score: {}/100, distance: {}km", 
          offer.getId(), score, distance);
      return new ContainerMatchResult(score, distance);
    }

    private double haversineKm(double lat1, double lon1, 
                             double lat2, double lon2) {
        double R = 6371; // Earth's radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    public ContainerMatchDTO getMatchById(Long matchId) {
        ContainerMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Match not found: " + matchId));
        return mapToDTO(match);
    }

    public List<ContainerMatchDTO> getMatchesByRequestId(Long requestId) {
        return matchRepository.findByRequestId(requestId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public void rejectMatch(Long matchId, Long userId) {
        ContainerMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Match not found: " + matchId));
        if (!match.getOffer().getProvider().getId().equals(userId) &&
                !match.getRequest().getSeeker().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User not involved in match: " + matchId);
        }
        match.setStatus(ContainerMatchStatus.REJECTED);
        matchRepository.save(match);
    }

    public List<ContainerMatchDTO> getMatchesByUserId(Long userId) {
        return matchRepository
                .findByOffer_Provider_IdOrRequest_Seeker_Id(userId, userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private ContainerMatchDTO mapToDTO(ContainerMatch match) {
        ContainerMatchDTO dto = new ContainerMatchDTO();
        dto.setId(match.getId());
        dto.setOfferId(match.getOffer().getId());
        dto.setRequestId(match.getRequest().getId());
        dto.setCompatibilityScore(match.getCompatibilityScore());
        dto.setDistanceKm(match.getDistanceKm());
        dto.setOfferLocation(match.getOffer().getLocation());
        dto.setRequestLocation(match.getRequest().getLoadingLocation());
        dto.setContainerType(match.getOffer().getContainerType());
        dto.setStatus(match.getStatus());
        dto.setCreatedAt(match.getCreatedAt());
        
        // Handle null provider safely
        if (match.getOffer().getProvider() != null) {
            dto.setOfferProviderId(match.getOffer().getProvider().getId());
        }
        
        // Handle null seeker safely  
        if (match.getRequest().getSeeker() != null) {
            dto.setRequestSeekerId(match.getRequest().getSeeker().getId());
        }
        
        return dto;
    }
}
