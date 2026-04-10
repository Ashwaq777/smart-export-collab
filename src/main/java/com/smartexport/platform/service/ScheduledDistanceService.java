package com.smartexport.platform.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class ScheduledDistanceService {

    private final DistanceService distanceService;
    private final JavaMailSender mailSender;
    private final UserRequestService userRequestService;

    public ScheduledDistanceService(DistanceService distanceService,
                                    JavaMailSender mailSender,
                                    UserRequestService userRequestService) {

        this.distanceService = distanceService;
        this.mailSender = mailSender;
        this.userRequestService = userRequestService;
    }

    @Scheduled(fixedRate = 2400000)
    public void sendDistanceAutomatically() {

        if (!userRequestService.hasRequest()) {
            return;
        }

        String imo = userRequestService.getImo();
        String place = userRequestService.getPlace();
        String email = userRequestService.getEmail();
        String apiKey = userRequestService.getApiKey();

        distanceService.calculateDistanceFromPlace(imo, apiKey, place)
                .subscribe(distance -> {

                    String text = "Distance entre " + place +
                            " et le navire : " +
                            String.format("%.2f km", distance);

                    SimpleMailMessage message = new SimpleMailMessage();

                    message.setFrom("hamza.laabail.uhp@gmail.com");
                    message.setTo(email);
                    message.setSubject("Distance du navire (auto)");
                    message.setText(text);

                    mailSender.send(message);

                    System.out.println("Email automatique envoyé : " + text);
                });
    }
}
