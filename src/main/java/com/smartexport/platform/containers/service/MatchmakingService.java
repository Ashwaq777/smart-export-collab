package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerMatchDTO;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
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

        // Get ALL available offers except seeker's own
        List<ContainerOffer> availableOffers = 
            offerRepository.findAll().stream()
              .filter(o -> o.getStatus().toString()
                .equals("AVAILABLE"))
              .filter(o -> !o.getProvider().getId()
                .equals(request.getSeeker().getId()))
              .filter(o -> o.getLatitude() != null 
                && o.getLongitude() != null)
              .collect(Collectors.toList());

        List<ContainerMatch> matches = new ArrayList<>();

        for (ContainerOffer offer : availableOffers) {
            ContainerMatchResult result = 
                calculateScore(offer, request);
            
            if (result == null) continue; // incompatible

            // Check if match already exists
            boolean exists = matchRepository
              .findByOfferId(offer.getId())
              .stream()
              .anyMatch(m -> m.getRequest().getId()
                .equals(requestId));
            
            if (!exists) {
                ContainerMatch match = new ContainerMatch();
                match.setOffer(offer);
                match.setRequest(request);
                match.setDistanceKm(result.distance);
                match.setCompatibilityScore(result.score);
                match.setStatus(ContainerMatchStatus.PENDING);
                matches.add(matchRepository.save(match));
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

      // ELIMINATOIRE — type must match exactly
      if (!offer.getContainerType()
          .equals(request.getContainerType())) {
        return null; // incompatible
      }

      double score = 0.0;

      // 1. CARGO TYPE (30 points)
      // Exact match = 30pts
      // Compatible match = 15pts (ex: DRY can carry GENERAL)
      // Incompatible = 0pts (eliminatoire si DANGEROUS/REEFER)
      if (offer.getCargoType() != null 
          && request.getCargoType() != null) {
        if (offer.getCargoType()
            .equals(request.getCargoType())) {
          score += 30;
        } else {
          // Check if cargo types are incompatible
          boolean offerIsSpecial = 
            offer.getCargoType().toString()
              .equals("DANGEROUS") ||
            offer.getCargoType().toString()
              .equals("REEFER");
          boolean reqIsSpecial = 
            request.getCargoType().toString()
              .equals("DANGEROUS") ||
            request.getCargoType().toString()
              .equals("REEFER");
          
          // If one is special and doesn't match — skip
          if (offerIsSpecial || reqIsSpecial) {
            return null; // incompatible
          }
          // Both are DRY/GENERAL — partial match
          score += 15;
        }
      } else {
        score += 15; // cargo not specified — neutral
      }

      // 2. GEOGRAPHIC PROXIMITY (40 points)
      // Use Haversine distance
      double distance = haversineKm(
        offer.getLatitude(), offer.getLongitude(),
        request.getLoadingLatitude(),
        request.getLoadingLongitude());

      double distanceScore;
      if (distance <= 100) distanceScore = 40;
      else if (distance <= 500) distanceScore = 35;
      else if (distance <= 1000) distanceScore = 25;
      else if (distance <= 2000) distanceScore = 15;
      else if (distance <= 5000) distanceScore = 8;
      else distanceScore = 3; // long distance possible

      score += distanceScore;

      // 3. DATE AVAILABILITY (30 points)
      // Offer must be available BEFORE required date
      if (offer.getAvailableDate() != null 
          && request.getRequiredDate() != null) {
        long daysDiff = java.time.temporal.ChronoUnit.DAYS
          .between(offer.getAvailableDate(),
                   request.getRequiredDate());
        
        if (daysDiff < 0) {
          return null; // offer available AFTER required date
        } else if (daysDiff >= 30) {
          score += 30; // plenty of time
        } else if (daysDiff >= 14) {
          score += 25; // 2 weeks notice
        } else if (daysDiff >= 7) {
          score += 15; // 1 week notice
        } else {
          score += 5; // very tight timeline
        }
      } else {
        score += 15; // dates not specified
      }

      // Minimum threshold: 40/100
      if (score < 40) return null;

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
