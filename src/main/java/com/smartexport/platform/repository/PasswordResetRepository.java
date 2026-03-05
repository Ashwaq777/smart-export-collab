package com.smartexport.platform.repository;

import com.smartexport.platform.entity.PasswordReset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetRepository extends JpaRepository<PasswordReset, Long> {
    Optional<PasswordReset> findByToken(String token);
}
