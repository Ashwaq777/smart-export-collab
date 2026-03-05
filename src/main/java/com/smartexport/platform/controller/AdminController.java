package com.smartexport.platform.controller;

import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.service.UserAdminService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Slf4j
public class AdminController {

    private final UserAdminService userAdminService;

    public AdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers() {
        return ResponseEntity.ok(userAdminService.listUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateRole(
        @PathVariable Long id,
        @RequestParam String role) {
        try {
            Role newRole = Role.valueOf(role);
            return ResponseEntity.ok(userAdminService.updateRole(id, newRole));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", role);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<User> updateStatus(
        @PathVariable Long id,
        @RequestParam String status) {
        try {
            UserStatus newStatus = UserStatus.valueOf(status);
            return ResponseEntity.ok(userAdminService.updateStatus(id, newStatus));
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }
}
