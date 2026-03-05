package com.smartexport.platform.service;

import com.smartexport.platform.entity.PasswordReset;
import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.repository.PasswordResetRepository;
import com.smartexport.platform.repository.UserRepository;
import com.smartexport.platform.security.JwtTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditService auditService;

    public AuthService(UserRepository userRepository,
                       PasswordResetRepository passwordResetRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.auditService = auditService;
    }

    public String login(String email, String password, 
                        String ip, String device) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            auditService.logAction(user.getId(), "LOGIN_FAILED", ip, device, false, "Account not active");
            throw new RuntimeException("Account not active");
        }

        if (user.getLockTime() != null && user.getLockTime().isAfter(LocalDateTime.now())) {
            auditService.logAction(user.getId(), "LOGIN_FAILED", ip, device, false, "Account locked");
            throw new RuntimeException("Account locked");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setFailedAttempts(user.getFailedAttempts() + 1);
            if (user.getFailedAttempts() >= 5) {
                user.setLockTime(LocalDateTime.now().plusHours(1));
                auditService.logAction(user.getId(), "ACCOUNT_LOCKED", ip, device, false, "Too many failed attempts");
            }
            userRepository.save(user);
            auditService.logAction(user.getId(), "LOGIN_FAILED", ip, device, false, "Invalid password");
            throw new RuntimeException("Invalid credentials");
        }

        user.setFailedAttempts(0);
        user.setLockTime(null);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAction(user.getId(), "LOGIN_SUCCESS", ip, device, true, null);

        return jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
    }

    public void register(String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        if (role == Role.ADMIN) {
            throw new RuntimeException("Cannot register as ADMIN");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedAttempts(0);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAction(user.getId(), "REGISTER", null, null, true, "Registered as " + role);
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElse(null);

        if (user == null) {
            return;
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusHours(24);

        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setUser(user);
        passwordReset.setToken(token);
        passwordReset.setExpiryDate(expiry);
        passwordReset.setUsed(false);
        passwordResetRepository.save(passwordReset);

        log.info("Password reset token for {}: {}", email, token);
        auditService.logAction(user.getId(), "PASSWORD_RESET_REQUESTED", null, null, true, null);
    }

    public void resetPassword(String token, String newPassword) {
        PasswordReset passwordReset = passwordResetRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (passwordReset.isUsed()) {
            throw new RuntimeException("Token already used");
        }

        if (passwordReset.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        User user = passwordReset.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        passwordReset.setUsed(true);
        passwordResetRepository.save(passwordReset);

        auditService.logAction(user.getId(), "PASSWORD_RESET", null, null, true, null);
    }
}
