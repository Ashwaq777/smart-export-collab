package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerTransactionDTO;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.notification.PushNotificationService;
import com.smartexport.platform.notification.dto.NotificationPayload;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContainerTransactionService {

    private final ContainerTransactionRepository transactionRepository;
    private final ContainerMatchRepository matchRepository;
    private final ContainerEmailService emailService;
    private final PushNotificationService pushNotificationService;
    private final EirPdfService eirPdfService;

    public ContainerTransactionService(ContainerTransactionRepository transactionRepository,
                                       ContainerMatchRepository matchRepository,
                                       ContainerEmailService emailService,
                                       PushNotificationService pushNotificationService,
                                       EirPdfService eirPdfService) {
        this.transactionRepository = transactionRepository;
        this.matchRepository = matchRepository;
        this.emailService = emailService;
        this.pushNotificationService = pushNotificationService;
        this.eirPdfService = eirPdfService;
    }

    public void confirmByProvider(Long matchId, Long userId) {
        ContainerMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Match not found: " + matchId));
        if (!match.getOffer().getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not the provider of match " + matchId);
        }
        ContainerTransaction tx = getOrCreateTransaction(match);
        tx.setConfirmedByProvider(true);
        if (Boolean.TRUE.equals(tx.getConfirmedBySeeker())) {
            match.setStatus(ContainerMatchStatus.CONFIRMED);
            matchRepository.save(match);
            transactionRepository.save(tx);
            
            // Send confirmation email when both parties have confirmed
            try {
                emailService.sendMatchConfirmedEmail(tx);
                
                // Push notifications for match confirmation
                pushNotificationService.notifyUser(
                    tx.getMatch().getOffer().getProvider().getEmail(),
                    NotificationPayload.matchConfirmed(tx.getId()));
                pushNotificationService.notifyUser(
                    tx.getMatch().getRequest().getSeeker().getEmail(),
                    NotificationPayload.matchConfirmed(tx.getId()));
                    
            } catch (Exception e) {
                log.warn("Notification failed for transaction {}: {}", 
                    tx.getId(), e.getMessage());
            }
        } else {
            transactionRepository.save(tx);
        }
    }

    public void confirmBySeeker(Long matchId, Long userId) {
        ContainerMatch match = matchRepository.findById(matchId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Match not found: " + matchId));
        if (!match.getRequest().getSeeker().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not the seeker of match " + matchId);
        }
        ContainerTransaction tx = getOrCreateTransaction(match);
        tx.setConfirmedBySeeker(true);
        if (Boolean.TRUE.equals(tx.getConfirmedByProvider())) {
            match.setStatus(ContainerMatchStatus.CONFIRMED);
            matchRepository.save(match);
            transactionRepository.save(tx);
            
            // Send confirmation email when both parties have confirmed
            try {
                emailService.sendMatchConfirmedEmail(tx);
                
                // Push notifications for match confirmation
                pushNotificationService.notifyUser(
                    tx.getMatch().getOffer().getProvider().getEmail(),
                    NotificationPayload.matchConfirmed(tx.getId()));
                pushNotificationService.notifyUser(
                    tx.getMatch().getRequest().getSeeker().getEmail(),
                    NotificationPayload.matchConfirmed(tx.getId()));
                    
            } catch (Exception e) {
                log.warn("Notification failed for transaction {}: {}", 
                    tx.getId(), e.getMessage());
            }
        } else {
            transactionRepository.save(tx);
        }
    }

    public ContainerTransactionDTO getTransaction(Long transactionId) {
        ContainerTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Transaction not found: " + transactionId));
        return mapToDTO(tx);
    }

    public ContainerTransactionDTO getTransactionByMatchId(Long matchId) {
        ContainerTransaction tx = transactionRepository.findByMatchId(matchId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Transaction not found for match: " + matchId));
        return mapToDTO(tx);
    }

    public void updateWorkflowStatus(Long transactionId,
                                    WorkflowStatus newStatus,
                                    Long userId) {
        ContainerTransaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Transaction not found: " + transactionId));
        if (!isUserInvolved(tx, userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not involved in transaction " + transactionId);
        }
        tx.setWorkflowStatus(newStatus);
        transactionRepository.save(tx);
        
        // Send workflow update email
        try {
            emailService.sendWorkflowUpdateEmail(tx);
            
            // Push notification for workflow update
            pushNotificationService.notifyUser(
                tx.getMatch().getRequest().getSeeker().getEmail(),
                NotificationPayload.workflowUpdate(
                    tx.getId(),
                    newStatus.toString()));
                    
        } catch (Exception e) {
            log.warn("Notification failed for transaction {}: {}", 
                tx.getId(), e.getMessage());
        }
    }

    public String uploadEirDocument(Long transactionId, 
                                 MultipartFile file, 
                                 Long userId) throws IOException {
    ContainerTransaction transaction = transactionRepository
        .findById(transactionId)
        .orElseThrow(() -> new ContainerNotFoundException(
            "Transaction not found: " + transactionId));

    // Only provider can upload EIR
    Long providerId = transaction.getMatch().getOffer()
        .getProvider().getId();
    if (!providerId.equals(userId)) {
        throw new UnauthorizedContainerAccessException(
            "Only provider can upload EIR document");
    }

    // Save file
    String uploadDir = "uploads/eir-documents/";
    java.nio.file.Path uploadPath = 
        java.nio.file.Paths.get(uploadDir);
    if (!java.nio.file.Files.exists(uploadPath)) {
        java.nio.file.Files.createDirectories(uploadPath);
    }

    String ext = "";
    String orig = file.getOriginalFilename();
    if (orig != null && orig.contains(".")) {
        ext = orig.substring(orig.lastIndexOf("."));
    }
    String filename = "EIR_" + transactionId
        + "_" + System.currentTimeMillis() + ext;
    java.nio.file.Path filePath = uploadPath.resolve(filename);
    java.nio.file.Files.copy(
        file.getInputStream(), filePath,
        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

    transaction.setEirDocumentPath(uploadDir + filename);
    ContainerTransaction saved = transactionRepository.save(transaction);

    // Notify seeker by email
    notifySeekerEirUploaded(saved);

    log.info("EIR uploaded for tx {} by provider {}",
        transactionId, userId);
    return filename;
}

    public void deleteEirDocument(Long transactionId, Long userId) {
        ContainerTransaction tx = transactionRepository
            .findById(transactionId)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Transaction not found: " + transactionId));

        // Delete physical file if exists
        if (tx.getEirDocumentPath() != null) {
            try {
                java.nio.file.Files.deleteIfExists(
                    java.nio.file.Paths.get(
                        tx.getEirDocumentPath()));
            } catch (Exception e) {
                log.warn("Could not delete file: {}", 
                    e.getMessage());
            }
        }

        tx.setEirDocumentPath(null);
        transactionRepository.save(tx);
        log.info("EIR deleted for tx {}", transactionId);
    }

    public void deleteTransaction(Long transactionId, Long userId) {
        ContainerTransaction tx = transactionRepository
            .findById(transactionId)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Transaction not found: " + transactionId));

        // Delete physical EIR file if exists
        if (tx.getEirDocumentPath() != null) {
            try {
                java.nio.file.Files.deleteIfExists(
                    java.nio.file.Paths.get(
                        tx.getEirDocumentPath()));
            } catch (Exception e) {
                log.warn("Could not delete EIR file: {}",
                    e.getMessage());
            }
        }

        transactionRepository.delete(tx);
        log.info("Transaction {} deleted by user {}",
            transactionId, userId);
    }

    public List<ContainerTransactionDTO> getMyTransactions(Long userId) {
        return transactionRepository
                .findByMatchOfferProviderIdOrMatchRequestSeekerId(userId, userId)
                .stream()
                .map(tx -> {
                    try {
                        return mapToDTO(tx);
                    } catch (Exception e) {
                        log.error("Error mapping tx {}: {}",
                            tx.getId(), e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());
    }

    private ContainerTransaction getOrCreateTransaction(ContainerMatch match) {
        return transactionRepository.findByMatch(match).orElseGet(() -> {
            ContainerTransaction newTx = new ContainerTransaction();
            newTx.setMatch(match);
            newTx.setConfirmedByProvider(false);
            newTx.setConfirmedBySeeker(false);
            newTx.setWorkflowStatus(WorkflowStatus.AT_PROVIDER);
            return transactionRepository.save(newTx);
        });
    }

    private void notifySeekerEirUploaded(ContainerTransaction tx) {
        try {
            String seekerEmail = tx.getMatch()
                .getRequest().getSeeker().getEmail();
            String seekerName = tx.getMatch()
                .getRequest().getSeeker().getFirstName();

            String html = """
              <div style="font-family:Arial,sans-serif;
                max-width:600px;margin:0 auto;">
                <div style="background:#1a73e8;color:white;
                  padding:20px;border-radius:8px 8px 0 0;">
                  <h2 style="margin:0">
                    📄 Document EIR Disponible
                  </h2>
                </div>
                <div style="padding:24px;background:#f8f9fa;
                  border-radius:0 0 8px 8px;">
                  <p>Bonjour %s,</p>
                  <p>Le provider a déposé le document 
                  <b>EIR (Equipment Interchange Receipt)</b>
                  pour votre transaction.</p>
                  <p>Connectez-vous à la plateforme pour 
                  le télécharger dans l'onglet 
                  <b>Transactions</b>.</p>
                  <p style="color:#6b7280;font-size:12px;">
                    © 2026 Smart Export Global
                  </p>
                </div>
              </div>
              """.formatted(seekerName);

            emailService.sendHtmlEmail(
                seekerEmail,
                "📄 Document EIR disponible — "
                + "Smart Export Global",
                html);
        } catch (Exception e) {
            log.error("EIR notification failed: {}",
                e.getMessage());
        }
    }

    private boolean isUserInvolved(ContainerTransaction tx, Long userId) {
        try {
            Long providerId = tx.getMatch().getOffer().getProvider().getId();
            Long seekerId = tx.getMatch().getRequest().getSeeker().getId();
            return userId.equals(providerId) || userId.equals(seekerId);
        } catch (Exception e) {
            log.warn("Error checking user involvement for transaction {}: {}", 
                tx.getId(), e.getMessage());
            return false;
        }
    }

    private ContainerTransactionDTO mapToDTO(ContainerTransaction tx) {
        ContainerTransactionDTO dto = new ContainerTransactionDTO();
        dto.setId(tx.getId());
        dto.setMatchId(tx.getMatch() != null ? tx.getMatch().getId() : null);
        dto.setOfferId(tx.getMatch() != null && tx.getMatch().getOffer() != null 
            ? tx.getMatch().getOffer().getId() : null);
        dto.setRequestId(tx.getMatch() != null && tx.getMatch().getRequest() != null 
            ? tx.getMatch().getRequest().getId() : null);
        dto.setConfirmedByProvider(tx.getConfirmedByProvider() != null 
            ? tx.getConfirmedByProvider() : false);
        dto.setConfirmedBySeeker(tx.getConfirmedBySeeker() != null 
            ? tx.getConfirmedBySeeker() : false);
        dto.setEirDocumentPath(tx.getEirDocumentPath());
        dto.setWorkflowStatus(tx.getWorkflowStatus());
        dto.setCreatedAt(tx.getCreatedAt());
        dto.setUpdatedAt(tx.getUpdatedAt());
        return dto;
    }

    public Long getProviderIdForTransaction(Long transactionId) {
        ContainerTransaction tx = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ContainerNotFoundException("Transaction not found: " + transactionId));
        return tx.getMatch().getOffer().getProvider().getId();
    }

    public Long getSeekerIdForTransaction(Long transactionId) {
        ContainerTransaction tx = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ContainerNotFoundException("Transaction not found: " + transactionId));
        return tx.getMatch().getRequest().getSeeker().getId();
    }
}
