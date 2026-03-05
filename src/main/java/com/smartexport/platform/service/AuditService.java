package com.smartexport.platform.service;

import com.smartexport.platform.entity.UserActivityLog;
import com.smartexport.platform.repository.UserActivityLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class AuditService {

    private final UserActivityLogRepository logRepository;

    public AuditService(UserActivityLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    public void logAction(Long userId, String action, 
                          String ipAddress, String deviceInfo, 
                          boolean success, String details) {
        UserActivityLog log = new UserActivityLog();
        log.setUserId(userId);
        log.setAction(action);
        log.setIpAddress(ipAddress);
        log.setDeviceInfo(deviceInfo);
        log.setSuccess(success);
        log.setDetails(details);
        log.setTimestamp(LocalDateTime.now());
        logRepository.save(log);
    }
}
