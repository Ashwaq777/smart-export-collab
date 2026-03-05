package com.smartexport.platform.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// ADDED: Audit log entity for auth/account activity
@Entity
@Table(name = "user_activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false, length = 100)
    private String action;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "device_info", length = 255)
    private String deviceInfo;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Boolean success;

    @Column(columnDefinition = "TEXT")
    private String details;

    @PrePersist
    protected void onCreate() {
        // ADDED: Defaults
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (success == null) {
            success = true;
        }
    }
}
