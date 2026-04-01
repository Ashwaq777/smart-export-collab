package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.DirectRequestDTO;
import com.smartexport.platform.containers.service.DirectRequestService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(
    "/api/v1/containers/direct-requests")
@Tag(name = "Direct Requests")
@Slf4j
public class DirectRequestController {

    private final DirectRequestService service;
    private final com.smartexport.platform
        .repository.UserRepository userRepository;

    public DirectRequestController(
        DirectRequestService service,
        com.smartexport.platform.repository
            .UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    @PostMapping("/offers/{offerId}")
    @Operation(summary = "Send direct request")
    public ResponseEntity<ContainerApiResponse
            <DirectRequestDTO>> send(
            @PathVariable Long offerId,
            @RequestBody DirectRequestDTO dto) {
        Long seekerId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        DirectRequestDTO result =
            service.sendRequest(
                offerId, seekerId, dto);
        return ResponseEntity
            .status(
                org.springframework.http
                    .HttpStatus.CREATED)
            .body(ContainerApiResponse.success(
                "Demande envoyée", result));
    }

    @PatchMapping("/{id}/respond")
    @Operation(summary = "Respond to request")
    public ResponseEntity<ContainerApiResponse
            <DirectRequestDTO>> respond(
            @PathVariable Long id,
            @RequestParam boolean accepted,
            @RequestParam(required = false)
                String response) {
        Long providerId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        DirectRequestDTO result =
            service.respond(
                id, providerId, accepted, response);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                accepted
                    ? "Demande acceptée"
                    : "Demande refusée",
                result));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my sent requests")
    public ResponseEntity<ContainerApiResponse
            <java.util.List<DirectRequestDTO>>> getMine() {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                service.getMySentRequests(userId)));
    }

    @GetMapping("/received")
    @Operation(summary = "Get received requests")
    public ResponseEntity<ContainerApiResponse
            <java.util.List<DirectRequestDTO>>> getReceived() {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                service.getReceivedRequests(userId)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete direct request")
    public ResponseEntity<ContainerApiResponse<Void>> delete(
            @PathVariable Long id) {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        service.deleteDirectRequest(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                "Demande directe supprimée", null));
    }
}
