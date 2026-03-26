package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.DirectRequestDTO;
import com.smartexport.platform.containers.entity.ContainerDirectRequest;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.enums.DirectRequestStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.containers.repository.ContainerDirectRequestRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@Slf4j
public class DirectRequestService {

    private final ContainerDirectRequestRepository 
        directRequestRepository;
    private final ContainerOfferRepository 
        offerRepository;
    private final com.smartexport.platform
        .repository.UserRepository userRepository;
    private final ContainerEmailService emailService;

    public DirectRequestService(
        ContainerDirectRequestRepository 
            directRequestRepository,
        ContainerOfferRepository offerRepository,
        com.smartexport.platform.repository
            .UserRepository userRepository,
        ContainerEmailService emailService) {
        this.directRequestRepository = 
            directRequestRepository;
        this.offerRepository = offerRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public DirectRequestDTO sendRequest(
            Long offerId, Long seekerId,
            DirectRequestDTO dto) {

        ContainerOffer offer = offerRepository
            .findById(offerId)
            .orElseThrow(() ->
                new ContainerNotFoundException(
                    "Offer not found: " + offerId));

        com.smartexport.platform.entity.User seeker =
            userRepository.findById(seekerId)
            .orElseThrow(() ->
                new ContainerNotFoundException(
                    "User not found: " + seekerId));

        if (directRequestRepository
                .existsByOfferIdAndSeekerId(
                    offerId, seekerId)) {
            throw new IllegalStateException(
                "Vous avez déjà envoyé une demande "
                + "pour cette offre");
        }

        ContainerDirectRequest req =
            new ContainerDirectRequest();
        req.setOffer(offer);
        req.setSeeker(seeker);
        req.setMessage(dto.getMessage());
        req.setSeekerCompany(dto.getSeekerCompany());
        req.setRequiredDate(dto.getRequiredDate());
        req.setStatus(DirectRequestStatus.PENDING);

        ContainerDirectRequest saved =
            directRequestRepository.save(req);

        sendEmailToProvider(saved);
        log.info("Direct request {} sent for offer {}",
            saved.getId(), offerId);

        return mapToDTO(saved);
    }

    public DirectRequestDTO respond(
            Long requestId, Long providerId,
            boolean accepted, String response) {

        ContainerDirectRequest req =
            directRequestRepository
                .findById(requestId)
                .orElseThrow(() ->
                    new ContainerNotFoundException(
                        "Request not found"));

        if (!req.getOffer().getProvider()
                .getId().equals(providerId)) {
            throw new 
                UnauthorizedContainerAccessException(
                    "Not authorized");
        }

        req.setStatus(accepted
            ? DirectRequestStatus.ACCEPTED
            : DirectRequestStatus.REJECTED);
        req.setProviderResponse(response);
        req.setRespondedAt(
            java.time.LocalDateTime.now());

        ContainerDirectRequest saved =
            directRequestRepository.save(req);

        sendEmailToSeeker(saved);
        return mapToDTO(saved);
    }

    public java.util.List<DirectRequestDTO> getMySentRequests(
            Long seekerId) {
        return directRequestRepository
            .findBySeekerIdOrderByCreatedAtDesc(seekerId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public java.util.List<DirectRequestDTO> 
            getReceivedRequests(Long providerId) {
        return directRequestRepository
            .findByOffer_Provider_IdOrderByCreatedAtDesc(
                providerId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    private void sendEmailToProvider(
            ContainerDirectRequest req) {
        try {
            String to = req.getOffer()
                .getProvider().getEmail();
            String seekerName = 
                req.getSeeker().getFirstName()
                + " " 
                + req.getSeeker().getLastName();

            String html = """
                <div style="font-family:Arial,
                  sans-serif;max-width:600px;
                  margin:0 auto;">
                  <div style="background:#1a73e8;
                    color:white;padding:20px;
                    border-radius:8px 8px 0 0;">
                    <h2 style="margin:0">
                      📩 Nouvelle Demande de Conteneur
                    </h2>
                    <p style="margin:8px 0 0;
                      opacity:0.9">
                      Smart Export Global
                    </p>
                  </div>
                  <div style="padding:24px;
                    background:#f8f9fa;
                    border-radius:0 0 8px 8px;">
                    <p>Bonjour,</p>
                    <p><b>%s</b> souhaite utiliser 
                    votre conteneur <b>%s</b> 
                    disponible à <b>%s</b>.</p>
                    <div style="background:white;
                      padding:16px;border-radius:8px;
                      border-left:4px solid #1a73e8;
                      margin:16px 0;">
                      <b>Message:</b><br/>%s
                    </div>
                    <table style="width:100%%;
                      border-collapse:collapse;">
                      <tr>
                        <td style="padding:8px;
                          border-bottom:1px solid #eee;">
                          <b>Date souhaitée</b>
                        </td>
                        <td style="padding:8px;
                          border-bottom:1px solid #eee;">
                          %s
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">
                          <b>Entreprise</b>
                        </td>
                        <td style="padding:8px;">
                          %s
                        </td>
                      </tr>
                    </table>
                    <p style="margin-top:20px;">
                      Connectez-vous pour répondre 
                      à cette demande.
                    </p>
                    <p style="color:#6b7280;
                      font-size:12px;margin-top:24px;">
                      © 2026 Smart Export Global
                    </p>
                  </div>
                </div>
                """.formatted(
                    seekerName,
                    req.getOffer().getContainerType(),
                    req.getOffer().getLocation(),
                    req.getMessage(),
                    req.getRequiredDate() != null
                        ? req.getRequiredDate()
                            .toString()
                        : "Non spécifiée",
                    req.getSeekerCompany() != null
                        ? req.getSeekerCompany()
                        : "Non spécifiée");

            emailService.sendHtmlEmail(
                to,
                "📩 Nouvelle demande pour votre "
                + "conteneur — Smart Export Global",
                html);

            log.info("Email sent to provider: {}", to);
        } catch (Exception e) {
            log.error("Email to provider failed: {}",
                e.getMessage());
        }
    }

    private void sendEmailToSeeker(
            ContainerDirectRequest req) {
        try {
            String to = req.getSeeker().getEmail();
            boolean accepted = req.getStatus()
                == DirectRequestStatus.ACCEPTED;

            String html = """
                <div style="font-family:Arial,
                  sans-serif;max-width:600px;
                  margin:0 auto;">
                  <div style="background:%s;
                    color:white;padding:20px;
                    border-radius:8px 8px 0 0;">
                    <h2 style="margin:0">%s</h2>
                  </div>
                  <div style="padding:24px;
                    background:#f8f9fa;
                    border-radius:0 0 8px 8px;">
                    <p>Bonjour %s,</p>
                    <p>Le provider a <b>%s</b> 
                    votre demande pour le conteneur 
                    <b>%s</b> à <b>%s</b>.</p>
                    %s
                    <p style="color:#6b7280;
                      font-size:12px;margin-top:24px;">
                      © 2026 Smart Export Global
                    </p>
                  </div>
                </div>
                """.formatted(
                    accepted ? "#16a34a" : "#dc2626",
                    accepted
                        ? "✅ Demande Acceptée !"
                        : "❌ Demande Refusée",
                    req.getSeeker().getFirstName(),
                    accepted ? "accepté" : "refusé",
                    req.getOffer().getContainerType(),
                    req.getOffer().getLocation(),
                    req.getProviderResponse() != null
                        ? "<div style='background:white;"
                          + "padding:12px;"
                          + "border-radius:8px;"
                          + "border-left:4px solid "
                          + (accepted
                              ? "#16a34a"
                              : "#dc2626")
                          + ";margin:12px 0'>"
                          + "<b>Message:</b><br/>"
                          + req.getProviderResponse()
                          + "</div>"
                        : "");

            emailService.sendHtmlEmail(
                to,
                (accepted ? "✅" : "❌")
                + " Réponse à votre demande — "
                + "Smart Export Global",
                html);

            log.info("Email sent to seeker: {}", to);
        } catch (Exception e) {
            log.error("Email to seeker failed: {}",
                e.getMessage());
        }
    }

    public DirectRequestDTO mapToDTO(
            ContainerDirectRequest req) {
        DirectRequestDTO dto = new DirectRequestDTO();
        dto.setId(req.getId());
        if (req.getOffer() != null) {
            dto.setOfferId(req.getOffer().getId());
            dto.setOfferLocation(
                req.getOffer().getLocation());
            dto.setContainerType(req.getOffer()
                .getContainerType().toString());
        }
        if (req.getSeeker() != null) {
            dto.setSeekerId(req.getSeeker().getId());
            dto.setSeekerName(
                req.getSeeker().getFirstName()
                + " "
                + req.getSeeker().getLastName());
            dto.setSeekerEmail(
                req.getSeeker().getEmail());
        }
        dto.setMessage(req.getMessage());
        dto.setSeekerCompany(req.getSeekerCompany());
        dto.setRequiredDate(req.getRequiredDate());
        dto.setStatus(req.getStatus());
        dto.setProviderResponse(
            req.getProviderResponse());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setRespondedAt(req.getRespondedAt());
        return dto;
    }
}
