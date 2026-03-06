package com.smartexport.platform.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartexport.platform.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}