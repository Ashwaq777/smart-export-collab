package com.smartexport.platform.support.service;

import com.smartexport.platform.support.dto.SupportTicketDTO;
import com.smartexport.platform.support.entity.SupportTicket;
import com.smartexport.platform.support.entity.enums.TicketCategory;
import com.smartexport.platform.support.entity.enums.TicketPriority;
import com.smartexport.platform.support.entity.enums.TicketStatus;
import com.smartexport.platform.support.repository.SupportTicketRepository;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class SupportService {

    private final SupportTicketRepository repository;
    private final com.smartexport.platform
        .repository.UserRepository userRepository;
    private final ContainerEmailService 
        emailService;

    public SupportService(
        SupportTicketRepository repository,
        com.smartexport.platform.repository
            .UserRepository userRepository,
        ContainerEmailService 
            emailService) {
        this.repository = repository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    public SupportTicketDTO createTicket(
            Long userId, SupportTicketDTO dto) {
        com.smartexport.platform.entity.User user =
            userRepository.findById(userId)
                .orElseThrow(() -> 
                    new RuntimeException(
                        "User not found"));

        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(dto.getSubject());
        ticket.setDescription(dto.getDescription());
        ticket.setCategory(dto.getCategory() != null
            ? dto.getCategory()
            : TicketCategory.AUTRE);
        ticket.setPriority(dto.getPriority() != null
            ? dto.getPriority()
            : TicketPriority.MEDIUM);
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setRelatedOfferId(
            dto.getRelatedOfferId());
        ticket.setRelatedTransactionId(
            dto.getRelatedTransactionId());

        SupportTicket saved = repository.save(ticket);

        // Send confirmation email to user
        sendConfirmationEmail(saved);

        log.info("Ticket {} created by user {}",
            saved.getId(), userId);
        return mapToDTO(saved);
    }

    public List<SupportTicketDTO> getMyTickets(
            Long userId) {
        return repository
            .findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    // ADMIN methods
    public List<SupportTicketDTO> getAllTickets() {
        return repository
            .findAllByOrderByCreatedAtDesc()
            .stream()
            .map(this::mapToDTO)
            .collect(Collectors.toList());
    }

    public SupportTicketDTO respondToTicket(
            Long ticketId, String response,
            TicketStatus newStatus) {
        SupportTicket ticket = repository
            .findById(ticketId)
            .orElseThrow(() ->
                new RuntimeException(
                    "Ticket not found"));

        ticket.setAdminResponse(response);
        ticket.setStatus(newStatus != null
            ? newStatus : TicketStatus.IN_PROGRESS);

        SupportTicket saved = repository.save(ticket);

        // Send response email to user
        sendResponseEmail(saved);

        log.info("Ticket {} updated to status {}",
            ticketId, saved.getStatus());
        return mapToDTO(saved);
    }

    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", repository.count());
        stats.put("open", repository
            .countByStatus(TicketStatus.OPEN));
        stats.put("inProgress", repository
            .countByStatus(
                TicketStatus.IN_PROGRESS));
        stats.put("resolved", repository
            .countByStatus(TicketStatus.RESOLVED));
        return stats;
    }

    private void sendConfirmationEmail(
            SupportTicket ticket) {
        try {
            String html = """
                <div style="font-family:Arial,
                  sans-serif;max-width:600px;
                  margin:0 auto;">
                  <div style="background:#1a73e8;
                    color:white;padding:20px;
                    border-radius:8px 8px 0 0;">
                    <h2 style="margin:0">
                      🎫 Ticket Support Créé
                    </h2>
                  </div>
                  <div style="padding:24px;
                    background:#f8f9fa;
                    border-radius:0 0 8px 8px;">
                    <p>Bonjour %s,</p>
                    <p>Votre ticket <b>#%d</b> a été
                    créé avec succès.</p>
                    <div style="background:white;
                      padding:16px;border-radius:8px;
                      border-left:4px solid #1a73e8;
                      margin:16px 0;">
                      <b>Sujet:</b> %s<br/>
                      <b>Catégorie:</b> %s<br/>
                      <b>Priorité:</b> %s<br/>
                      <b>Statut:</b> En attente
                    </div>
                    <p>Notre équipe vous répondra 
                    dans les plus brefs délais.</p>
                    <p style="color:#6b7280;
                      font-size:12px;">
                      © 2026 Smart Export Global
                    </p>
                  </div>
                </div>
                """.formatted(
                    ticket.getUser().getFirstName(),
                    ticket.getId(),
                    ticket.getSubject(),
                    ticket.getCategory(),
                    ticket.getPriority());

            emailService.sendHtmlEmail(
                ticket.getUser().getEmail(),
                "🎫 Ticket #" + ticket.getId()
                + " créé — Smart Export Global",
                html);
        } catch (Exception e) {
            log.error("Confirmation email failed: {}",
                e.getMessage());
        }
    }

    private void sendResponseEmail(
            SupportTicket ticket) {
        try {
            String statusColor =
                ticket.getStatus() == 
                    TicketStatus.RESOLVED
                    ? "#16a34a" : "#1a73e8";

            String html = """
                <div style="font-family:Arial,
                  sans-serif;max-width:600px;
                  margin:0 auto;">
                  <div style="background:%s;
                    color:white;padding:20px;
                    border-radius:8px 8px 0 0;">
                    <h2 style="margin:0">
                      📬 Réponse à votre ticket
                    </h2>
                  </div>
                  <div style="padding:24px;
                    background:#f8f9fa;
                    border-radius:0 0 8px 8px;">
                    <p>Bonjour %s,</p>
                    <p>Votre ticket <b>#%d — %s</b>
                    a été mis à jour.</p>
                    <div style="background:white;
                      padding:16px;border-radius:8px;
                      border-left:4px solid %s;
                      margin:16px 0;">
                      <b>Réponse de l'équipe:</b>
                      <br/>%s
                    </div>
                    <p><b>Statut:</b> %s</p>
                    <p style="color:#6b7280;
                      font-size:12px;">
                      © 2026 Smart Export Global
                    </p>
                  </div>
                </div>
                """.formatted(
                    statusColor,
                    ticket.getUser().getFirstName(),
                    ticket.getId(),
                    ticket.getSubject(),
                    statusColor,
                    ticket.getAdminResponse(),
                    ticket.getStatus());

            emailService.sendHtmlEmail(
                ticket.getUser().getEmail(),
                "📬 Réponse ticket #" + ticket.getId()
                + " — Smart Export Global",
                html);
        } catch (Exception e) {
            log.error("Response email failed: {}",
                e.getMessage());
        }
    }

    public SupportTicketDTO mapToDTO(
            SupportTicket t) {
        SupportTicketDTO dto = new SupportTicketDTO();
        dto.setId(t.getId());
        if (t.getUser() != null) {
            dto.setUserId(t.getUser().getId());
            dto.setUserName(
                t.getUser().getFirstName() + " "
                + t.getUser().getLastName());
            dto.setUserEmail(t.getUser().getEmail());
            dto.setUserRole(
                t.getUser().getRole() != null
                ? t.getUser().getRole().toString()
                : null);
            dto.setUserPhone(t.getUser().getPhone());
            dto.setUserCompany(
                t.getUser().getCompanyName());
            dto.setUserCountry(
                t.getUser().getCountry());
        }
        dto.setSubject(t.getSubject());
        dto.setDescription(t.getDescription());
        dto.setCategory(t.getCategory());
        dto.setStatus(t.getStatus());
        dto.setPriority(t.getPriority());
        dto.setAdminResponse(t.getAdminResponse());
        dto.setRelatedOfferId(t.getRelatedOfferId());
        dto.setRelatedTransactionId(
            t.getRelatedTransactionId());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }
}
