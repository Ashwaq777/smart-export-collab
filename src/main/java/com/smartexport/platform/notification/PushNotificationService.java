package com.smartexport.platform.notification;

import com.smartexport.platform.notification.dto.NotificationPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PushNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void notifyUser(String userEmail,
                            NotificationPayload payload) {
        try {
            messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notifications",
                payload);
            log.info("Push notification sent to {}: {}",
                userEmail, payload.getType());
        } catch (Exception e) {
            log.error("Failed to send push to {}: {}",
                userEmail, e.getMessage());
        }
    }

    public void notifyAll(NotificationPayload payload) {
        try {
            messagingTemplate.convertAndSend(
                "/topic/notifications", payload);
        } catch (Exception e) {
            log.error("Failed to broadcast: {}",
                e.getMessage());
        }
    }
}
