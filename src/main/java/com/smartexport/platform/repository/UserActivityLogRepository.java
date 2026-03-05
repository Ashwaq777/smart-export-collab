package com.smartexport.platform.repository;

import com.smartexport.platform.entity.UserActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserActivityLogRepository extends JpaRepository<UserActivityLog, Long> {
}
