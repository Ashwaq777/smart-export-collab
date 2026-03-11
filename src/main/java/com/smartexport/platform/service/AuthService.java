package com.smartexport.platform.service;

import com.smartexport.platform.dto.auth.LoginResponse;
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

import java.time.LocalDate;
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

    public String login(String email, String password, String ip, String device) {
    var user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
    
    if (user.getStatus() == UserStatus.BLOCKED) {
        throw new RuntimeException("Account blocked");
    }
    
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
        int attempts = user.getFailedAttempts() == null ? 0 : user.getFailedAttempts();
        attempts++;
        user.setFailedAttempts(attempts);
        if (attempts >= 5) {
            user.setStatus(UserStatus.BLOCKED);
            user.setLockTime(LocalDateTime.now());
        }
        userRepository.save(user);
        throw new RuntimeException("Invalid credentials");
    }
    
    user.setFailedAttempts(0);
    user.setLastLogin(LocalDateTime.now());
    userRepository.save(user);
    
    auditService.logAction(user.getId(), "LOGIN", ip, device, true, null);
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

    public void registerComplete(String firstName, String lastName, String email, String password, 
                                String phone, String birthDate, String companyName, String country, Role role) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        if (role == Role.ADMIN) {
            throw new RuntimeException("Cannot register as ADMIN");
        }

        User user = new User();
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setCompanyName(companyName);
        user.setCountry(country);
        
        // Convertir birthDate si fourni
        if (birthDate != null && !birthDate.trim().isEmpty()) {
            try {
                user.setBirthDate(LocalDate.parse(birthDate));
            } catch (Exception e) {
                log.warn("Invalid birth date format for user {}: {}", email, birthDate);
                // Ne pas échouer l'inscription si la date est invalide
            }
        }
        
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setFailedAttempts(0);
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);

        auditService.logAction(user.getId(), "REGISTER_COMPLETE", null, null, true, 
            String.format("Registered as %s with company: %s", role, companyName));
    }
}
