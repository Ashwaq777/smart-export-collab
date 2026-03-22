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

@Service
@Slf4j
public class MatchmakingService {

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

        List<ContainerOffer> availableOffers =
                offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE);

        List<ContainerMatch> scoredMatches = new ArrayList<>();

        for (ContainerOffer offer : availableOffers) {

            double distance = calculateDistance(
                    offer.getLatitude(), offer.getLongitude(),
                    request.getLoadingLatitude(), request.getLoadingLongitude()
            );

            double score = 0;

            if (distance < 100) {
                score += 40;
            } else if (distance < 500) {
                score += 25;
            } else {
                score += 10;
            }

            if (offer.getContainerType() == request.getContainerType()) {
                score += 40;
            }

            if (!offer.getAvailableDate().isAfter(request.getRequiredDate())) {
                score += 20;
            }

            ContainerMatch match = new ContainerMatch();
            match.setOffer(offer);
            match.setRequest(request);
            match.setDistanceKm(distance);
            match.setCompatibilityScore(score);
            match.setStatus(ContainerMatchStatus.PENDING);

            scoredMatches.add(match);
        }

        scoredMatches.sort((a, b) ->
                Double.compare(b.getCompatibilityScore(), a.getCompatibilityScore()));

        List<ContainerMatch> top5 = scoredMatches.stream()
                .limit(5)
                .collect(Collectors.toList());

        // Save matches and send email notifications
        List<ContainerMatch> savedMatches = top5.stream()
                .map(matchRepository::save)
                .collect(Collectors.toList());

        // Send email notifications for each saved match
        for (ContainerMatch savedMatch : savedMatches) {
            try {
                emailService.sendMatchFoundEmail(savedMatch);
                
                // Push notification to provider
                pushNotificationService.notifyUser(
                    savedMatch.getOffer().getProvider().getEmail(),
                    NotificationPayload.matchFound(
                        savedMatch.getId(),
                        savedMatch.getOffer().getContainerType().toString(),
                        savedMatch.getOffer().getLocation()));

                // Push notification to seeker
                pushNotificationService.notifyUser(
                    savedMatch.getRequest().getSeeker().getEmail(),
                    NotificationPayload.matchFound(
                        savedMatch.getId(),
                        savedMatch.getOffer().getContainerType().toString(),
                        savedMatch.getOffer().getLocation()));
                        
            } catch (Exception e) {
                log.warn("Notification failed for match {}: {}", 
                    savedMatch.getId(), e.getMessage());
            }
        }

        return savedMatches.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

    private double calculateDistance(double lat1, double lon1,
                                     double lat2, double lon2) {
        double R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1))
                * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private ContainerMatchDTO mapToDTO(ContainerMatch match) {
        ContainerMatchDTO dto = new ContainerMatchDTO();
        dto.setId(match.getId());
        dto.setOfferId(match.getOffer().getId());
        dto.setRequestId(match.getRequest().getId());
        
        // Handle null provider safely
        if (match.getOffer().getProvider() != null) {
            dto.setOfferProviderId(match.getOffer().getProvider().getId());
        }
        
        // Handle null seeker safely  
        if (match.getRequest().getSeeker() != null) {
            dto.setRequestSeekerId(match.getRequest().getSeeker().getId());
        }
        
        dto.setOfferLocation(match.getOffer().getLocation());
        dto.setRequestLocation(match.getRequest().getLoadingLocation());
        dto.setContainerType(match.getOffer().getContainerType());
        dto.setDistanceKm(match.getDistanceKm());
        dto.setCompatibilityScore(match.getCompatibilityScore());
        dto.setStatus(match.getStatus());
        dto.setCreatedAt(match.getCreatedAt());
        return dto;
    }
}
