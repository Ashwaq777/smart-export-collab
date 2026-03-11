package com.smartexport.platform.service;

import com.smartexport.platform.entity.PasswordReset;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.PasswordResetRepository;
import com.smartexport.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

// ADDED: Password reset flow (token generation, validation, password update)
@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetRepository passwordResetRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final long expiryMinutes;
    private final String resetPasswordBaseUrl;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetRepository passwordResetRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService,
            @Value("${app.password-reset.expiry-minutes:30}") long expiryMinutes,
            @Value("${app.frontend.reset-password-url:http://localhost:5173/reset-password}") String resetPasswordBaseUrl
    ) {
        this.userRepository = userRepository;
        this.passwordResetRepository = passwordResetRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.expiryMinutes = expiryMinutes;
        this.resetPasswordBaseUrl = resetPasswordBaseUrl;
    }

    public void requestReset(String email) {
        // ADDED: Do not disclose whether email exists
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return;
        }

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(expiryMinutes);

        PasswordReset pr = new PasswordReset();
        pr.setUser(user);
        pr.setToken(token);
        pr.setExpiryDate(expiry);
        pr.setUsed(false);

        passwordResetRepository.save(pr);

        String link = resetPasswordBaseUrl + "?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), token);
    }

    public boolean validateToken(String token) {
        return passwordResetRepository.findByToken(token)
                .filter(pr -> Boolean.FALSE.equals(pr.getUsed()))
                .filter(pr -> pr.getExpiryDate() != null && LocalDateTime.now().isBefore(pr.getExpiryDate()))
                .isPresent();
    }

    public void resetPassword(String token, String newPassword) {
        PasswordReset pr = passwordResetRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (Boolean.TRUE.equals(pr.getUsed())) {
            throw new IllegalArgumentException("Token already used");
        }
        if (pr.getExpiryDate() == null || LocalDateTime.now().isAfter(pr.getExpiryDate())) {
            throw new IllegalArgumentException("Token expired");
        }

        User user = pr.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        pr.setUsed(true);
        passwordResetRepository.save(pr);
    }
}
