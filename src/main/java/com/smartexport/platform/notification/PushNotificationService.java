package com.smartexport.platform.notification;

import com.smartexport.platform.notification.dto.NotificationPayload;
import com.smartexport.platform.notification.entity.Notification;
import com.smartexport.platform.notification.repository.NotificationRepository;
import com.smartexport.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class PushNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public void notifyUser(String userEmail,
                            NotificationPayload payload) {
        try {
            messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notifications",
                payload);
            log.info("Push notification sent to {}: {}",
                userEmail, payload.getType());
                
            // Create notification in database
            createNotificationInDb(userEmail, payload);
        } catch (Exception e) {
            log.error("Failed to send push to {}: {}",
                userEmail, e.getMessage());
        }
    }

    public void notifyUser(String userEmail,
                            NotificationPayload payload,
                            String customMessage) {
        try {
            messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notifications",
                payload);
            log.info("Push notification sent to {}: {}",
                userEmail, payload.getType());
                
            // Create notification in database with custom message
            createNotificationInDb(userEmail, payload, customMessage);
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
    
    private void createNotificationInDb(String userEmail, NotificationPayload payload) {
        try {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setTitle(payload.getTitle());
                notification.setMessage(payload.getMessage());
                notification.setType(payload.getType());
                notification.setRead(false);
                notificationRepository.save(notification);
                log.info("Notification saved in database for user {}", userEmail);
            });
        } catch (Exception e) {
            log.error("Failed to save notification in database for {}: {}", 
                userEmail, e.getMessage());
        }
    }
    
    private void createNotificationInDb(String userEmail, NotificationPayload payload, String customMessage) {
        try {
            userRepository.findByEmail(userEmail).ifPresent(user -> {
                Notification notification = new Notification();
                notification.setUser(user);
                notification.setTitle(payload.getTitle());
                notification.setMessage(customMessage);
                notification.setType(payload.getType());
                notification.setRead(false);
                notificationRepository.save(notification);
                log.info("Custom notification saved in database for user {}", userEmail);
            });
        } catch (Exception e) {
            log.error("Failed to save custom notification in database for {}: {}", 
                userEmail, e.getMessage());
        }
    }
}
