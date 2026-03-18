package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.ContainerMatchDTO;
import com.smartexport.platform.containers.dto.ContainerRequestDTO;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.service.ContainerRequestService;
import com.smartexport.platform.containers.service.MatchmakingService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/containers/requests")
@Tag(name = "Container Requests", description = "Manage container requests")
@RequiredArgsConstructor
public class ContainerRequestController {

    private final ContainerRequestService requestService;
    private final MatchmakingService matchmakingService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a container request")
    public ResponseEntity<ContainerApiResponse<ContainerRequestDTO>>
            createRequest(@RequestBody ContainerRequestDTO dto) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ContainerApiResponse.success("Request created",
                requestService.createRequest(dto, userId)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my requests")
    public ResponseEntity<ContainerApiResponse<List<ContainerRequestDTO>>>
            getMyRequests() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                requestService.getRequestsBySeeker(userId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update request")
    public ResponseEntity<ContainerApiResponse<ContainerRequestDTO>>
            updateRequest(@PathVariable Long id,
                          @RequestBody ContainerRequestDTO dto) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                requestService.updateRequest(id, dto, userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get request by ID")
    public ResponseEntity<ContainerApiResponse<ContainerRequestDTO>>
            getById(@PathVariable Long id) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                requestService.getRequestById(id)));
    }

    @PostMapping("/{id}/match")
    @Operation(summary = "Trigger matchmaking for this request")
    public ResponseEntity<ContainerApiResponse<List<ContainerMatchDTO>>>
            triggerMatchmaking(@PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        ContainerRequestDTO request = requestService.getRequestById(id);
        if (!request.getSeekerId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                "Only the owner can trigger matchmaking");
        }
        List<ContainerMatchDTO> matches = matchmakingService.findMatches(id);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                matches.size() + " matches found", matches));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update request status")
    public ResponseEntity<ContainerApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam ContainerRequestStatus status) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        requestService.updateRequestStatus(id, status, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Status updated", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete request")
    public ResponseEntity<ContainerApiResponse<Void>> deleteRequest(
            @PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        requestService.deleteRequest(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Request deleted", null));
    }
}
