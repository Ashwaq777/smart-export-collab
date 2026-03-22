package com.smartexport.platform.vessels.service;

import com.smartexport.platform.vessels.dto.VesselPositionDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class VesselAlertService {

    private final VesselDistanceService distanceService;
    private final JavaMailSender mailSender;

    @Value("${container.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${container.mail.from:noreply@smartexportglobal.com}")
    private String fromAddress;

    public VesselAlertService(
            VesselDistanceService distanceService,
            JavaMailSender mailSender) {
        this.distanceService = distanceService;
        this.mailSender = mailSender;
    }

    public Mono<Map<String, Object>> checkAndAlert(
            String imo, String place, String email) {

        return distanceService
            .calculateDistanceToPlace(imo, place)
            .flatMap(distance -> 
                distanceService.getVesselPosition(imo)
                    .map(vessel -> {
                        Map<String, Object> result = 
                            new HashMap<>();
                        result.put("imo", imo);
                        result.put("vessel", vessel);
                        result.put("destinationPort", place);
                        result.put("distanceKm", distance);
                        boolean near = distance < 5.0;
                        result.put("isNearPort", near);

                        if (near && mailEnabled
                            && email != null
                            && !email.isBlank()) {
                            sendAlert(vessel, place,
                                distance, email);
                            result.put("emailSent", true);
                        } else {
                            result.put("emailSent", false);
                        }
                        return result;
                    }))
            .onErrorResume(e -> {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", e.getMessage());
                return Mono.just(err);
            });
    }

    private void sendAlert(VesselPositionDTO vessel,
                            String port, double distance,
                            String email) {
        try {
            SimpleMailMessage message = 
                new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(email);
            message.setSubject(
                "🚢 Navire proche du port de " + port);
            message.setText(
                "Bonjour,\n\n"
                + "Le navire " + vessel.getVesselName()
                + " (IMO: " + vessel.getImo() + ") "
                + "est proche du port de " + port + ".\n\n"
                + "Distance actuelle : "
                + String.format("%.2f km", distance) + "\n\n"
                + "Le navire va bientôt arriver au port.\n\n"
                + "© 2026 Smart Export Global");
            mailSender.send(message);
            log.info("Alert sent to {} for vessel {}",
                email, vessel.getImo());
        } catch (Exception e) {
            log.error("Failed to send alert: {}",
                e.getMessage());
        }
    }
}
