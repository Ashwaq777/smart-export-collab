package com.smartexport.platform.support.controller;

import com.smartexport.platform.support.dto.SupportTicketDTO;
import com.smartexport.platform.support.entity.enums.TicketStatus;
import com.smartexport.platform.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/support")
@Tag(name = "Support")
@Slf4j
public class SupportController {

    private final SupportService supportService;
    private final com.smartexport.platform
        .repository.UserRepository userRepository;
    private final com.smartexport.platform
        .security.JwtTokenProvider jwtTokenProvider;

    public SupportController(
        SupportService supportService,
        com.smartexport.platform.repository
            .UserRepository userRepository,
        com.smartexport.platform.security
            .JwtTokenProvider jwtTokenProvider) {
        this.supportService = supportService;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private Long getCurrentUserId(
            jakarta.servlet.http.HttpServletRequest 
            req) {
        String header = 
            req.getHeader("Authorization");
        String token = header.substring(7);
        String email = jwtTokenProvider
            .getEmailFromToken(token);
        return userRepository
            .findByEmail(email)
            .map(u -> u.getId())
            .orElseThrow(() ->
                new RuntimeException(
                    "User not found"));
    }

    // USER: create ticket
    @PostMapping
    public ResponseEntity<?> create(
            @RequestBody SupportTicketDTO dto,
            jakarta.servlet.http.HttpServletRequest 
            req) {
        Long userId = getCurrentUserId(req);
        SupportTicketDTO result =
            supportService.createTicket(userId, dto);
        return ResponseEntity
            .status(
                org.springframework.http
                    .HttpStatus.CREATED)
            .body(result);
    }

    // USER: get my tickets
    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(
            jakarta.servlet.http.HttpServletRequest 
            req) {
        Long userId = getCurrentUserId(req);
        return ResponseEntity.ok(
            supportService.getMyTickets(userId));
    }

    // ADMIN: get all tickets
    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllTickets() {
        return ResponseEntity.ok(
            supportService.getAllTickets());
    }

    // ADMIN: respond to ticket
    @PatchMapping("/admin/{id}/respond")
    public ResponseEntity<?> respond(
            @PathVariable Long id,
            @RequestParam String response,
            @RequestParam(required = false)
                String status) {
        TicketStatus newStatus = status != null
            ? TicketStatus.valueOf(status)
            : TicketStatus.IN_PROGRESS;
        return ResponseEntity.ok(
            supportService.respondToTicket(
                id, response, newStatus));
    }

    // ADMIN: get stats
    @GetMapping("/admin/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(
            supportService.getStats());
    }
}
