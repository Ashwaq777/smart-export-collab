package com.smartexport.platform.controller;

import com.smartexport.platform.dto.auth.*;
import com.smartexport.platform.entity.Role;
import com.smartexport.platform.repository.UserRepository;
import com.smartexport.platform.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        try {
            String ip = httpRequest.getRemoteAddr();
            String device = httpRequest.getHeader("User-Agent");
            String token = authService.login(request.getEmail(), 
                                             request.getPassword(), ip, device);
            var user = userRepository.findByEmail(request.getEmail()).get();
            return ResponseEntity.ok(new LoginResponse(
                token, user.getEmail(), user.getRole().name()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            Role role = Role.valueOf(request.getRole());
            authService.register(request.getEmail(), request.getPassword(), role);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        } catch (RuntimeException e) {
            log.error("Registration failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
        @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
        @RequestBody ResetPasswordRequest request) {
        try {
            authService.resetPassword(request.getToken(), request.getNewPassword());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Password reset failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
