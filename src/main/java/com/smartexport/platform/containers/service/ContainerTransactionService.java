package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerTransactionDTO;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
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

    public ContainerTransactionService(ContainerTransactionRepository transactionRepository,
                                       ContainerMatchRepository matchRepository,
                                       ContainerEmailService emailService) {
        this.transactionRepository = transactionRepository;
        this.matchRepository = matchRepository;
        this.emailService = emailService;
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
            // Send confirmation email when both parties have confirmed
            try {
                emailService.sendMatchConfirmedEmail(tx);
            } catch (Exception e) {
                log.warn("Email notification failed for transaction {}: {}", 
                    tx.getId(), e.getMessage());
            }
        }
        transactionRepository.save(tx);
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
            // Send confirmation email when both parties have confirmed
            try {
                emailService.sendMatchConfirmedEmail(tx);
            } catch (Exception e) {
                log.warn("Email notification failed for transaction {}: {}", 
                    tx.getId(), e.getMessage());
            }
        }
        transactionRepository.save(tx);
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
        } catch (Exception e) {
            log.warn("Email notification failed for transaction {}: {}", 
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

    // Save file
    String uploadDir = "uploads/eir/";
    java.nio.file.Path uploadPath = 
        java.nio.file.Paths.get(uploadDir);
    if (!java.nio.file.Files.exists(uploadPath)) {
        java.nio.file.Files.createDirectories(uploadPath);
    }

    String filename = java.util.UUID.randomUUID() + "_" 
        + file.getOriginalFilename();
    java.nio.file.Path filePath = uploadPath.resolve(filename);
    java.nio.file.Files.copy(
        file.getInputStream(), filePath,
        java.nio.file.StandardCopyOption.REPLACE_EXISTING);

    transaction.setEirDocumentPath(uploadDir + filename);
    transactionRepository.save(transaction);

    log.info("EIR uploaded for tx {} by user {}: {}", 
        transactionId, userId, filename);
    return filename;
}

    public List<ContainerTransactionDTO> getMyTransactions(Long userId) {
        return transactionRepository
                .findByMatchOfferProviderIdOrMatchRequestSeekerId(userId, userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
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
        dto.setMatchId(tx.getMatch().getId());
        dto.setOfferId(tx.getMatch().getOffer().getId());
        dto.setRequestId(tx.getMatch().getRequest().getId());
        dto.setConfirmedByProvider(tx.getConfirmedByProvider());
        dto.setConfirmedBySeeker(tx.getConfirmedBySeeker());
        dto.setEirDocumentPath(tx.getEirDocumentPath());
        dto.setWorkflowStatus(tx.getWorkflowStatus());
        dto.setCreatedAt(tx.getCreatedAt());
        dto.setUpdatedAt(tx.getUpdatedAt());
        return dto;
    }
}
