package com.smartexport.platform.service;

import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@Slf4j
public class BootstrapService implements ApplicationListener<ContextRefreshedEvent> {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public BootstrapService(UserRepository userRepository, 
                            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (!userRepository.existsByEmail("admin@smartexport.com")) {
            User admin = new User();
            admin.setEmail("admin@smartexport.com");
            admin.setPasswordHash(passwordEncoder.encode("Admin@2024"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setFailedAttempts(0);
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            log.info("Admin créé : admin@smartexport.com");
        }
    }
}
