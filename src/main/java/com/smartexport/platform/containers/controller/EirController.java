package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.ContainerTransactionDTO;
import com.smartexport.platform.containers.service.ContainerTransactionService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/eir")
@Tag(name = "EIR Documents", description = "Manage EIR documents independently")
@RequiredArgsConstructor
public class EirController {

    private final ContainerTransactionService transactionService;
    private final UserRepository userRepository;

    // GET /my-documents - list EIR documents available for current user
    @GetMapping("/my-documents")
    @Operation(summary = "Get all EIR documents for current user")
    public ResponseEntity<ContainerApiResponse<List<EirDocumentInfo>>> getMyEirDocuments() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        List<ContainerTransactionDTO> transactions = transactionService.getMyTransactions(userId);
        
        List<EirDocumentInfo> eirDocs = transactions.stream()
            .filter(tx -> tx.getEirDocumentPath() != null && !tx.getEirDocumentPath().isBlank())
            .map(tx -> {
                // Get the actual provider and seeker IDs from the transaction service
                Long providerId = transactionService.getProviderIdForTransaction(tx.getId());
                Long seekerId = transactionService.getSeekerIdForTransaction(tx.getId());
                return new EirDocumentInfo(
                    tx.getId(),
                    tx.getEirDocumentPath(),
                    extractFilename(tx.getEirDocumentPath()),
                    tx.getOfferLocation(),
                    tx.getRequestLocation(),
                    providerId.equals(userId) // isProvider
                );
            })
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(
            ContainerApiResponse.success("EIR documents retrieved", eirDocs));
    }

    // GET /download/{transactionId} - download EIR document
    @GetMapping("/download/{transactionId}")
    @Operation(summary = "Download EIR document by transaction ID")
    public ResponseEntity<FileSystemResource> downloadEir(
            @PathVariable Long transactionId) throws IOException {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        
        ContainerTransactionDTO tx = transactionService.getTransaction(transactionId);
        
        // Check if user is involved in this transaction
        Long providerId = transactionService.getProviderIdForTransaction(transactionId);
        Long seekerId = transactionService.getSeekerIdForTransaction(transactionId);
        if (!providerId.equals(userId) && !seekerId.equals(userId)) {
            return ResponseEntity.status(403).build();
        }
        
        String path = tx.getEirDocumentPath();
        if (path == null || path.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        java.io.File file = new java.io.File(path);
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        FileSystemResource resource = new FileSystemResource(file);
        
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"" + file.getName() + "\"")
            .contentType(MediaType.APPLICATION_PDF)
            .body(resource);
    }

    // POST /upload/{transactionId} - upload EIR document
    @PostMapping(value = "/upload/{transactionId}", 
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload EIR document for transaction")
    public ResponseEntity<ContainerApiResponse<String>> uploadEir(
            @PathVariable Long transactionId,
            @RequestParam("file") MultipartFile file) {
        try {
            Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
            String filename = transactionService.uploadEirDocument(transactionId, file, userId);
            return ResponseEntity.ok(
                ContainerApiResponse.success("EIR uploaded successfully", filename));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(ContainerApiResponse.error(
                    "Upload failed: " + e.getMessage()));
        }
    }

    // DELETE /{transactionId} - delete EIR document
    @DeleteMapping("/{transactionId}")
    @Operation(summary = "Delete EIR document")
    public ResponseEntity<ContainerApiResponse<Void>> deleteEir(
            @PathVariable Long transactionId) {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);
        transactionService.deleteEirDocument(transactionId, userId);
        return ResponseEntity.ok(
            ContainerApiResponse.success("EIR deleted successfully", null));
    }

    private String extractFilename(String path) {
        if (path == null) return null;
        int lastSlash = path.lastIndexOf('/');
        return lastSlash >= 0 ? path.substring(lastSlash + 1) : path;
    }

    // DTO for EIR document info
    public static class EirDocumentInfo {
        public Long transactionId;
        public String documentPath;
        public String filename;
        public String offerLocation;
        public String requestLocation;
        public Boolean isProvider;

        public EirDocumentInfo(Long transactionId, String documentPath, String filename,
                              String offerLocation, String requestLocation, Boolean isProvider) {
            this.transactionId = transactionId;
            this.documentPath = documentPath;
            this.filename = filename;
            this.offerLocation = offerLocation;
            this.requestLocation = requestLocation;
            this.isProvider = isProvider;
        }
    }
}
