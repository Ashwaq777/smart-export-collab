package com.smartexport.platform.containers.notification;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

@Service
@Slf4j
public class ContainerEmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${container.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${container.mail.from:noreply@smartexportglobal.com}")
    private String fromAddress;

    // Constructor injection
    public ContainerEmailService(JavaMailSender mailSender,
                                  TemplateEngine templateEngine) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
    }

    public void sendMatchFoundEmail(ContainerMatch match) {
        if (!mailEnabled) {
            log.info("Mail disabled. Match {} notification skipped.",
                match.getId());
            return;
        }
        try {
            Context ctx = buildMatchFoundContext(match);
            // Send to provider
            sendHtmlEmail(
                match.getOffer().getProvider().getEmail(),
                "🎯 Smart Export Global - Correspondance trouvée !",
                "containers/match-found", ctx);
            // Send to seeker
            sendHtmlEmail(
                match.getRequest().getSeeker().getEmail(),
                "🎯 Smart Export Global - Correspondance trouvée !",
                "containers/match-found", ctx);
        } catch (Exception e) {
            log.error("Failed to send match-found email: {}", e.getMessage());
        }
    }

    public void sendMatchConfirmedEmail(ContainerTransaction transaction) {
        if (!mailEnabled) {
            log.info("Mail disabled. Confirmation {} skipped.",
                transaction.getId());
            return;
        }
        try {
            Context ctx = buildConfirmationContext(transaction);
            ContainerMatch match = transaction.getMatch();
            sendHtmlEmail(
                match.getOffer().getProvider().getEmail(),
                "✅ Smart Export Global - Match Confirmé !",
                "containers/match-confirmed", ctx);
            sendHtmlEmail(
                match.getRequest().getSeeker().getEmail(),
                "✅ Smart Export Global - Match Confirmé !",
                "containers/match-confirmed", ctx);
        } catch (Exception e) {
            log.error("Failed to send confirmation email: {}", e.getMessage());
        }
    }

    public void sendWorkflowUpdateEmail(ContainerTransaction transaction) {
        if (!mailEnabled) {
            log.info("Mail disabled. Workflow update {} skipped.",
                transaction.getId());
            return;
        }
        try {
            Context ctx = buildWorkflowContext(transaction);
            sendHtmlEmail(
                transaction.getMatch().getRequest().getSeeker().getEmail(),
                "📦 Smart Export Global - Mise à jour du statut",
                "containers/workflow-update", ctx);
        } catch (Exception e) {
            log.error("Failed to send workflow email: {}", e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject,
                                String template, Context ctx)
            throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
            message, true, "UTF-8");
        helper.setFrom(fromAddress);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(templateEngine.process(template, ctx), true);
        mailSender.send(message);
        log.info("Email sent → {} | {}", to, subject);
    }

    private Context buildMatchFoundContext(ContainerMatch match) {
        Context ctx = new Context(Locale.FRENCH);
        // Use EXACT field names from User entity read in STEP 3
        ctx.setVariable("providerName",
            match.getOffer().getProvider().getFirstName() + " " +
            match.getOffer().getProvider().getLastName());
        ctx.setVariable("seekerName",
            match.getRequest().getSeeker().getFirstName() + " " +
            match.getRequest().getSeeker().getLastName());
        ctx.setVariable("containerType",
            match.getOffer().getContainerType().toString());
        ctx.setVariable("cargoType",
            match.getOffer().getCargoType() != null ?
            match.getOffer().getCargoType().toString() : "N/A");
        ctx.setVariable("distanceKm",
            String.format("%.0f", match.getDistanceKm()));
        ctx.setVariable("compatibilityScore",
            String.format("%.0f", match.getCompatibilityScore()));
        ctx.setVariable("offerLocation",
            match.getOffer().getLocation());
        ctx.setVariable("requestLocation",
            match.getRequest().getLoadingLocation());
        ctx.setVariable("availableDate",
            match.getOffer().getAvailableDate().toString());
        ctx.setVariable("requiredDate",
            match.getRequest().getRequiredDate().toString());
        
        // Set recipient name dynamically based on who we're sending to
        ctx.setVariable("recipientName", "Utilisateur");
        
        return ctx;
    }

    private Context buildConfirmationContext(ContainerTransaction tx) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("transactionId", tx.getId().toString());
        ctx.setVariable("containerType",
            tx.getMatch().getOffer().getContainerType().toString());
        ctx.setVariable("providerName",
            tx.getMatch().getOffer().getProvider().getFirstName() + " " +
            tx.getMatch().getOffer().getProvider().getLastName());
        ctx.setVariable("seekerName",
            tx.getMatch().getRequest().getSeeker().getFirstName() + " " +
            tx.getMatch().getRequest().getSeeker().getLastName());
        ctx.setVariable("offerLocation",
            tx.getMatch().getOffer().getLocation());
        ctx.setVariable("requestLocation",
            tx.getMatch().getRequest().getLoadingLocation());
        
        // Set recipient name dynamically based on who we're sending to
        ctx.setVariable("recipientName", "Utilisateur");
        
        return ctx;
    }

    private Context buildWorkflowContext(ContainerTransaction tx) {
        Context ctx = new Context(Locale.FRENCH);
        ctx.setVariable("transactionId", tx.getId().toString());
        ctx.setVariable("containerType",
            tx.getMatch().getOffer().getContainerType().toString());
        ctx.setVariable("newStatus",
            tx.getWorkflowStatus().toString());

        Map<String, String> labels = new HashMap<>();
        labels.put("AT_PROVIDER", "🏭 Chez l'importateur");
        labels.put("IN_TRANSIT", "🚛 En transport");
        labels.put("DELIVERED_TO_EXPORTER", "📦 Livré à l'exportateur");
        labels.put("LOADING", "⚓ Chargement en cours");
        labels.put("COMPLETED", "✅ Transaction terminée");
        ctx.setVariable("statusLabel",
            labels.getOrDefault(
                tx.getWorkflowStatus().toString(), "En cours"));
        
        // Set recipient name dynamically based on who we're sending to
        ctx.setVariable("recipientName", "Utilisateur");
        
        return ctx;
    }
}
