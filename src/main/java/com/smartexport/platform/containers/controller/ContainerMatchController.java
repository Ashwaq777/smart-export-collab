package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.ContainerMatchDTO;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.service.ContainerTransactionService;
import com.smartexport.platform.containers.service.MatchmakingService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/containers/matches")
@Tag(name = "Container Matches", description = "Manage container matches")
@RequiredArgsConstructor
public class ContainerMatchController {

    private final MatchmakingService matchmakingService;
    private final ContainerTransactionService transactionService;
    private final UserRepository userRepository;

    // GET /{id} — get match details
    @GetMapping("/{id}")
    @Operation(summary = "Get match details")
    public ResponseEntity<ContainerApiResponse<ContainerMatchDTO>>
            getMatch(@PathVariable Long id) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                matchmakingService.getMatchById(id)));
    }

    // POST /{id}/confirm — confirm match
    // Detects automatically if user is provider or seeker
    @PostMapping("/{id}/confirm")
    @Operation(summary = "Confirm a match - works for both provider and seeker")
    public ResponseEntity<ContainerApiResponse<Void>>
            confirmMatch(@PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        ContainerMatchDTO match = matchmakingService.getMatchById(id);

        // Determine role and confirm accordingly
        if (match.getOfferProviderId() != null &&
            match.getOfferProviderId().equals(userId)) {
            transactionService.confirmByProvider(id, userId);
            return ResponseEntity.ok(
                ContainerApiResponse.success("Confirmed as provider", null));
        } else if (match.getRequestSeekerId() != null &&
                   match.getRequestSeekerId().equals(userId)) {
            transactionService.confirmBySeeker(id, userId);
            return ResponseEntity.ok(
                ContainerApiResponse.success("Confirmed as seeker", null));
        } else {
            throw new UnauthorizedContainerAccessException(
                "User is not involved in this match");
        }
    }

    // POST /{id}/reject — reject match
    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject a match")
    public ResponseEntity<ContainerApiResponse<Void>>
            rejectMatch(@PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        ContainerMatchDTO match = matchmakingService.getMatchById(id);
        if (!match.getOfferProviderId().equals(userId) &&
            !match.getRequestSeekerId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                "User is not involved in this match");
        }
        // Update match status to REJECTED via matchmakingService
        matchmakingService.rejectMatch(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Match rejected", null));
    }

    // GET /my — get all matches involving current user
    @GetMapping("/my")
    @Operation(summary = "Get all matches involving current user")
    public ResponseEntity<ContainerApiResponse<List<ContainerMatchDTO>>>
            getMyMatches() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                matchmakingService.getMatchesByUserId(userId)));
    }
}
