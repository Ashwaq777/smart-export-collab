package com.smartexport.platform.controller;

import com.smartexport.platform.entity.User;
import com.smartexport.platform.service.AuthService;
import com.smartexport.platform.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            Map<String, Object> userDTO = new HashMap<>();
            userDTO.put("id", user.getId());
            userDTO.put("firstName", user.getFirstName());
            userDTO.put("lastName", user.getLastName());
            userDTO.put("email", user.getEmail());
            userDTO.put("phone", user.getPhone());
            userDTO.put("companyName", user.getCompanyName());
            userDTO.put("country", user.getCountry());
            userDTO.put("role", user.getRole() != null ? user.getRole().toString() : "USER");
            userDTO.put("status", user.getStatus() != null ? user.getStatus().toString() : "ACTIVE");
            userDTO.put("createdAt", user.getCreatedAt());
            userDTO.put("lastLogin", user.getLastLogin());
            
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            log.error("Error fetching current user", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(
            @RequestBody Map<String, String> updates,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Update fields if provided
            if (updates.containsKey("firstName") && !updates.get("firstName").trim().isEmpty()) {
                user.setFirstName(updates.get("firstName").trim());
            }
            if (updates.containsKey("lastName") && !updates.get("lastName").trim().isEmpty()) {
                user.setLastName(updates.get("lastName").trim());
            }
            if (updates.containsKey("phone") && !updates.get("phone").trim().isEmpty()) {
                user.setPhone(updates.get("phone").trim());
            }
            if (updates.containsKey("companyName") && !updates.get("companyName").trim().isEmpty()) {
                user.setCompanyName(updates.get("companyName").trim());
            }
            if (updates.containsKey("country") && !updates.get("country").trim().isEmpty()) {
                user.setCountry(updates.get("country").trim());
            }
            
            User updatedUser = userService.save(user);
            
            Map<String, Object> userDTO = new HashMap<>();
            userDTO.put("id", updatedUser.getId());
            userDTO.put("firstName", updatedUser.getFirstName());
            userDTO.put("lastName", updatedUser.getLastName());
            userDTO.put("email", updatedUser.getEmail());
            userDTO.put("phone", updatedUser.getPhone());
            userDTO.put("companyName", updatedUser.getCompanyName());
            userDTO.put("country", updatedUser.getCountry());
            userDTO.put("role", updatedUser.getRole() != null ? updatedUser.getRole().toString() : "USER");
            userDTO.put("status", updatedUser.getStatus() != null ? updatedUser.getStatus().toString() : "ACTIVE");
            userDTO.put("createdAt", updatedUser.getCreatedAt());
            userDTO.put("lastLogin", updatedUser.getLastLogin());
            
            log.info("User profile updated: {}", email);
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            log.error("Error updating user profile", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error updating profile"));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> passwordData,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing required fields"));
            }
            
            User user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Current password is incorrect"));
            }
            
            // Update password
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            userService.save(user);
            
            log.info("Password changed for user: {}", email);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (Exception e) {
            log.error("Error changing password", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error changing password"));
        }
    }
}
