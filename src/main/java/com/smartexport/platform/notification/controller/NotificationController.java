package com.smartexport.platform.notification.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.notification.dto.NotificationDTO;
import com.smartexport.platform.notification.entity.Notification;
import com.smartexport.platform.notification.repository.NotificationRepository;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Manage user notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @GetMapping("/my")
    @Operation(summary = "Get my notifications")
    public ResponseEntity<ContainerApiResponse<List<NotificationDTO>>> getMyNotifications() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        
        // Limit to 20 most recent notifications
        List<Notification> limitedNotifications = notifications.stream()
                .limit(20)
                .collect(Collectors.toList());
        
        List<NotificationDTO> dtos = limitedNotifications.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(ContainerApiResponse.success(dtos));
    }

    @GetMapping("/my/unread-count")
    @Operation(summary = "Get unread notifications count")
    public ResponseEntity<ContainerApiResponse<Long>> getUnreadCount() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        Long count = notificationRepository.countUnreadByUserId(userId);
        return ResponseEntity.ok(ContainerApiResponse.success(count));
    }

    @PutMapping("/my/mark-read")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ContainerApiResponse<Void>> markAllAsRead() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        notificationRepository.markAllAsReadByUserId(userId);
        return ResponseEntity.ok(ContainerApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping("/my/clear")
    @Operation(summary = "Clear all notifications")
    public ResponseEntity<ContainerApiResponse<Void>> clearAllNotifications() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifications);
        return ResponseEntity.ok(ContainerApiResponse.success("All notifications cleared", null));
    }

    private NotificationDTO mapToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.getRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
