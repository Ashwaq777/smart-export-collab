package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.ContainerOfferDTO;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.service.ContainerOfferService;
import com.smartexport.platform.containers.service.PortService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/containers/offers")
@Tag(name = "Container Offers", description = "Manage container offers")
@RequiredArgsConstructor
public class ContainerOfferController {

    private final ContainerOfferService offerService;
    private final UserRepository userRepository;

    @PostMapping
    @Operation(summary = "Create a new container offer")
    public ResponseEntity<ContainerApiResponse<ContainerOfferDTO>>
            createOffer(@RequestBody ContainerOfferDTO dto) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ContainerApiResponse.success("Offer created",
                offerService.createOffer(dto, userId)));
    }

    @GetMapping
    @Operation(summary = "Get all available offers")
    public ResponseEntity<ContainerApiResponse<List<ContainerOfferDTO>>>
            getAllAvailable() {
        return ResponseEntity.ok(
            ContainerApiResponse.success(offerService.getAvailableOffers()));
    }

    @GetMapping("/my")
    @Operation(summary = "Get my offers")
    public ResponseEntity<ContainerApiResponse<List<ContainerOfferDTO>>>
            getMyOffers() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                offerService.getOffersByProvider(userId)));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update offer")
    public ResponseEntity<ContainerApiResponse<ContainerOfferDTO>>
            updateOffer(@PathVariable Long id,
                        @RequestBody ContainerOfferDTO dto) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                offerService.updateOffer(id, dto, userId)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get offer by ID")
    public ResponseEntity<ContainerApiResponse<ContainerOfferDTO>>
            getById(@PathVariable Long id) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(offerService.getOfferById(id)));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update offer status")
    public ResponseEntity<ContainerApiResponse<Void>> updateStatus(
            @PathVariable Long id,
            @RequestParam ContainerOfferStatus status) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        offerService.updateOfferStatus(id, status, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Status updated", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete offer")
    public ResponseEntity<ContainerApiResponse<Void>> deleteOffer(
            @PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        offerService.deleteOffer(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Offer deleted", null));
    }
}
