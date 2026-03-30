package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.ContainerTransactionDTO;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.service.ContainerTransactionService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/containers/transactions")
@Tag(name = "Container Transactions", description = "Manage transactions")
@RequiredArgsConstructor
public class ContainerTransactionController {

    private final ContainerTransactionService transactionService;
    private final UserRepository userRepository;

    // GET /{id}
    @GetMapping("/{id}")
    @Operation(summary = "Get transaction details")
    public ResponseEntity<ContainerApiResponse<ContainerTransactionDTO>>
            getTransaction(@PathVariable Long id) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                transactionService.getTransaction(id)));
    }

    // GET /my
    @GetMapping("/my")
    @Operation(summary = "Get my transactions")
    public ResponseEntity<ContainerApiResponse<List<ContainerTransactionDTO>>>
            getMyTransactions() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                transactionService.getMyTransactions(userId)));
    }

    // PATCH /{id}/workflow
    @PatchMapping("/{id}/workflow")
    @Operation(summary = "Update workflow status")
    public ResponseEntity<ContainerApiResponse<Void>> updateWorkflow(
            @PathVariable Long id,
            @RequestParam WorkflowStatus status) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        transactionService.updateWorkflowStatus(id, status, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Workflow updated to " + status, null));
    }

    // PUT /{id}/advance-status
    @PutMapping("/{id}/advance-status")
    @Operation(summary = "Advance workflow status to next step")
    public ResponseEntity<ContainerApiResponse<Void>> advanceStatus(
            @PathVariable Long id) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        transactionService.advanceWorkflowStatus(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Status advanced", null));
    }

    // POST /{id}/eir — upload EIR document
    @PostMapping(value = "/{id}/eir", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload EIR document")
    public ResponseEntity<ContainerApiResponse<String>> uploadEir(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            Long userId = ContainerSecurityUtils
                .getCurrentUserId(userRepository);
            String filename = transactionService
                .uploadEirDocument(id, file, userId);
            return ResponseEntity.ok(
                ContainerApiResponse.success("EIR uploaded", filename));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(ContainerApiResponse.error(
                    "Upload failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}/eir/download")
    @Operation(summary = "Download EIR PDF document")
    public ResponseEntity<FileSystemResource> downloadEir(
            @PathVariable Long id) throws IOException {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        
        ContainerTransactionDTO tx = 
            transactionService.getTransaction(id);
        
        String path = tx.getEirDocumentPath();
        if (path == null || path.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        java.io.File file = new java.io.File(path);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = 
            new FileSystemResource(file);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" 
                + file.getName() + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }

    @DeleteMapping("/{id}/eir")
    @Operation(summary = "Delete EIR document")
    public ResponseEntity<ContainerApiResponse<Void>> deleteEir(
            @PathVariable Long id) {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        transactionService.deleteEirDocument(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("EIR deleted", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete transaction")
    public ResponseEntity<ContainerApiResponse<Void>>
            deleteTransaction(@PathVariable Long id) {
        Long userId = ContainerSecurityUtils
            .getCurrentUserId(userRepository);
        transactionService.deleteTransaction(id, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("Transaction deleted", null));
    }

    // GET /match/{matchId}
    @GetMapping("/match/{matchId}")
    @Operation(summary = "Get transaction by match ID")
    public ResponseEntity<ContainerApiResponse<ContainerTransactionDTO>>
            getByMatch(@PathVariable Long matchId) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                transactionService.getTransactionByMatchId(matchId)));
    }
}
