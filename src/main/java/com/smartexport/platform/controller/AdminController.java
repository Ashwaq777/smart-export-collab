package com.smartexport.platform.controller;

import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import com.smartexport.platform.entity.Country;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.repository.PortRepository;
import com.smartexport.platform.service.CountryService;
import com.smartexport.platform.service.ExchangeRateService;
import com.smartexport.platform.service.OverpassPortService;
import com.smartexport.platform.service.UserAdminService;
import com.smartexport.platform.support.repository.SupportTicketRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Slf4j
public class AdminController {

    private final UserAdminService userAdminService;
    private final CountryService countryService;
    private final ExchangeRateService exchangeRateService;
    private final OverpassPortService overpassPortService;
    private final PortRepository portRepository;
    private final ContainerOfferRepository containerOfferRepository;
    private final ContainerMatchRepository containerMatchRepository;
    private final ContainerTransactionRepository containerTransactionRepository;
    private final SupportTicketRepository supportTicketRepository;

    public AdminController(UserAdminService userAdminService, CountryService countryService, ExchangeRateService exchangeRateService, OverpassPortService overpassPortService, PortRepository portRepository, ContainerOfferRepository containerOfferRepository, ContainerMatchRepository containerMatchRepository, ContainerTransactionRepository containerTransactionRepository, SupportTicketRepository supportTicketRepository) {
        this.userAdminService = userAdminService;
        this.countryService = countryService;
        this.exchangeRateService = exchangeRateService;
        this.overpassPortService = overpassPortService;
        this.portRepository = portRepository;
        this.containerOfferRepository = containerOfferRepository;
        this.containerMatchRepository = containerMatchRepository;
        this.containerTransactionRepository = containerTransactionRepository;
        this.supportTicketRepository = supportTicketRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            List<User> allUsers = userAdminService.listUsers();
            long totalUsers = allUsers.size();
            long activeUsers = allUsers.stream()
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .count();
            
            // Marketplace stats
            long totalOffers = 0;
            long activeOffers = 0;
            long totalMatches = 0;
            long totalTransactions = 0;
            long completedTransactions = 0;
            long pendingTickets = 0;
            
            try {
                totalOffers = containerOfferRepository.count();
                log.info("Total offers: {}", totalOffers);
            } catch (Exception e) {
                log.error("Error counting offers", e);
            }
            
            try {
                activeOffers = containerOfferRepository.findByStatus(ContainerOfferStatus.AVAILABLE).size();
                log.info("Active offers: {}", activeOffers);
            } catch (Exception e) {
                log.error("Error counting active offers", e);
            }
            
            try {
                totalMatches = containerMatchRepository.count();
                log.info("Total matches: {}", totalMatches);
            } catch (Exception e) {
                log.error("Error counting matches", e);
            }
            
            try {
                totalTransactions = containerTransactionRepository.count();
                log.info("Total transactions: {}", totalTransactions);
            } catch (Exception e) {
                log.error("Error counting transactions", e);
            }
            
            try {
                completedTransactions = containerTransactionRepository.findByWorkflowStatus(WorkflowStatus.COMPLETED).size();
                log.info("Completed transactions: {}", completedTransactions);
            } catch (Exception e) {
                log.error("Error counting completed transactions", e);
            }
            
            pendingTickets = 0; // Placeholder - SupportTicketStatus not implemented yet
            
            Map<String, Object> stats = new HashMap<>();
            // User stats
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("blockedUsers", allUsers.stream().filter(u -> u.getStatus() == UserStatus.BLOCKED).count());
            stats.put("adminCount", allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count());
            
            // Marketplace stats
            stats.put("totalOffers", totalOffers);
            stats.put("activeOffers", activeOffers);
            stats.put("totalMatches", totalMatches);
            stats.put("totalTransactions", totalTransactions);
            stats.put("completedTransactions", completedTransactions);
            stats.put("pendingTickets", pendingTickets);
            
            // Legacy stats for compatibility
            stats.put("totalSimulations", 1247L);
            stats.put("simulationsToday", 23L);
            
            log.info("Stats response: {}", stats.keySet());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getUsers() {
        try {
            List<User> users = userAdminService.listUsers();
            List<Map<String, Object>> userDTOs = users.stream()
                .map(user -> {
                    Map<String, Object> userDTO = new HashMap<>();
                    userDTO.put("id", user.getId());
                    userDTO.put("name", user.getEmail());
                    userDTO.put("email", user.getEmail());
                    userDTO.put("role", user.getRole() != null ? user.getRole().toString() : "USER");
                    userDTO.put("status", user.getStatus() != null ? user.getStatus().toString() : "ACTIVE");
                    return userDTO;
                })
                .toList();
            return ResponseEntity.ok(userDTOs);
        } catch (Exception e) {
            log.error("Error fetching users", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String, Object>> toggleUserStatus(@PathVariable Long id) {
        try {
            User user = userAdminService.toggleUserStatus(id);
            Map<String, Object> userDTO = new HashMap<>();
            userDTO.put("id", user.getId());
            userDTO.put("name", user.getEmail());
            userDTO.put("email", user.getEmail());
            userDTO.put("role", user.getRole() != null ? user.getRole().toString() : "USER");
            userDTO.put("status", user.getStatus() != null ? user.getStatus().toString() : "ACTIVE");
            return ResponseEntity.ok(userDTO);
        } catch (RuntimeException e) {
            log.error("Error toggling user status for id: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateRole(
        @PathVariable Long id,
        @RequestBody Map<String, String> request) {
        try {
            String role = request.get("role");
            if (role == null) {
                return ResponseEntity.badRequest().build();
            }
            Role newRole = Role.valueOf(role);
            return ResponseEntity.ok(userAdminService.updateRole(id, newRole));
        } catch (IllegalArgumentException e) {
            log.error("Invalid role: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            log.error("Error updating role for id: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        try {
            userAdminService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            log.error("Error deleting user with id: {}", id, e);
            return ResponseEntity.notFound().build();
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

    @GetMapping("/simulations")
    public ResponseEntity<List<Map<String, Object>>> getSimulations() {
        try {
            // Return placeholder data for now
            List<Map<String, Object>> simulations = List.of(
                Map.of("id", 1L, "reference", "SIM-001", "user", "Jean Dupont", 
                      "country", "Maroc", "hsCode", "8703", "totalCost", 15420L, "date", "2024-01-15"),
                Map.of("id", 2L, "reference", "SIM-002", "user", "Marie Martin", 
                      "country", "France", "hsCode", "6203", "totalCost", 8930L, "date", "2024-01-14"),
                Map.of("id", 3L, "reference", "SIM-003", "user", "Ahmed Hassan", 
                      "country", "Chine", "hsCode", "8517", "totalCost", 22100L, "date", "2024-01-13")
            );
            return ResponseEntity.ok(simulations);
        } catch (Exception e) {
            log.error("Error fetching simulations", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/countries")
    public ResponseEntity<?> getCountries() {
        try {
            return ResponseEntity.ok(countryService.getAll());
        } catch (Exception e) {
            log.error("Error fetching countries", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/countries/sync")
    public ResponseEntity<?> syncCountries() {
        try {
            List<Country> result = countryService.syncFromApi();
            return ResponseEntity.ok(Map.of(
                "synced", result.size(),
                "source", "restcountries.com"
            ));
        } catch (Exception e) {
            log.error("Error syncing countries", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/countries/{id}")
    public ResponseEntity<?> updateCountry(
        @PathVariable Long id,
        @RequestBody Country updates) {
        try {
            return ResponseEntity.ok(countryService.update(id, updates));
        } catch (Exception e) {
            log.error("Error updating country", e);
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/exchange-rates")
    public ResponseEntity<?> getExchangeRates() {
        try {
            return ResponseEntity.ok(exchangeRateService.getAllRates());
        } catch (Exception e) {
            log.error("Error fetching exchange rates", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/ports/sync-osm")
    public ResponseEntity<?> syncPortsFromOSM() {
        new Thread(() -> overpassPortService.syncFromOSM()).start();
        return ResponseEntity.ok(Map.of(
            "message", "OSM sync started in background",
            "source", "OpenStreetMap Overpass API",
            "note", "This takes 2-5 minutes, check /api/admin/ports for progress"
        ));
    }

    @GetMapping("/ports/count")
    public ResponseEntity<?> getPortCount() {
        return ResponseEntity.ok(Map.of(
            "total", portRepository.count()
        ));
    }

    @GetMapping("/ports")
    public ResponseEntity<?> getAllPorts(
        @RequestParam(defaultValue = "") String search) {
        List<Port> all;
        if (!search.isEmpty()) {
            String q = search.toLowerCase();
            all = portRepository.findAll().stream()
                .filter(p -> {
                    String n = (p.getNomPort() != null ? p.getNomPort() : "").toLowerCase();
                    String c = (p.getPays() != null ? p.getPays() : "").toLowerCase();
                    return n.contains(q) || c.contains(q);
                })
                .collect(Collectors.toList());
        } else {
            all = portRepository.findAll();
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/recent-transactions")
    public ResponseEntity<?> getRecentTransactions() {
        try {
            List<Map<String, Object>> transactions = containerTransactionRepository
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .limit(5)
                .map(tx -> {
                    Map<String, Object> txMap = new HashMap<>();
                    txMap.put("id", tx.getId());
                    txMap.put("workflowStatus", tx.getWorkflowStatus());
                    txMap.put("createdAt", tx.getCreatedAt());
                    
                    // Get provider and seeker info
                    if (tx.getMatch() != null) {
                        if (tx.getMatch().getOffer() != null && tx.getMatch().getOffer().getProvider() != null) {
                            txMap.put("provider", tx.getMatch().getOffer().getProvider().getEmail());
                        }
                        if (tx.getMatch().getRequest() != null && tx.getMatch().getRequest().getSeeker() != null) {
                            txMap.put("seeker", tx.getMatch().getRequest().getSeeker().getEmail());
                        }
                    }
                    
                    return txMap;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            log.error("Error fetching recent transactions", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
