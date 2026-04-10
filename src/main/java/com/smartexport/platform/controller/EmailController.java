package com.smartexport.platform.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartexport.platform.service.DistanceService;

import reactor.core.publisher.Mono;

@RestController
public class EmailController {
private final JavaMailSender mailSender;
private final DistanceService distanceService;
@Value("${app.api.key}")
private String apiKey;
@Value("${app.mail.from}")
private String fromEmail;

public EmailController(JavaMailSender mailSender, DistanceService distanceService) {
    this.mailSender = mailSender;
    this.distanceService = distanceService;
}

@GetMapping("/send-distance-email")
public Mono<String> sendDistanceEmail(
        @RequestParam String imo,
        @RequestParam String place,
        @RequestParam String email) {

    return distanceService.calculateDistanceFromPlace(imo, apiKey, place)
            .map(distance -> {

                String distanceText = String.format("%.2f km", distance);

                // 🚢 Si le navire est proche
                if (distance < 5) {

                    try {

                        SimpleMailMessage message = new SimpleMailMessage();

                        message.setFrom(fromEmail);
                        message.setTo(email);
                        message.setSubject("Navire proche du port de " + place);

                        message.setText(
                                "Bonjour,\n\n" +
                                "Le navire est proche du port de " + place + ".\n\n" +
                                "Distance actuelle : " + distanceText + ".\n\n" +
                                "Le navire va bientôt arriver au port."
                        );

                        mailSender.send(message);

                        return "Email envoyé ✔ Le navire est proche du port de "
                                + place + " (" + distanceText + ").";

                    } catch (Exception e) {

                        e.printStackTrace();
                        return "Erreur lors de l'envoi de l'email : " + e.getMessage();
                    }
                }

                // 🚢 Si le navire est loin
                else {

                    return "Le navire est encore loin du port de "
                            + place + " (" + distanceText + "). "
                            + "Vous recevrez un email lorsqu'il sera proche.";
                }

            })
            .onErrorResume(e -> {

                e.printStackTrace();
                return Mono.just("Erreur serveur : " + e.getMessage());
            });
}


}