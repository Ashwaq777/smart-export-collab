package com.smartexport.platform.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.smartexport.platform.dto.TraceabilityDTO;
import com.smartexport.platform.entity.TraceabilityRecord;
import com.smartexport.platform.repository.TraceabilityRecordRepository;
import com.smartexport.platform.service.TraceabilityService;

@RestController
@RequestMapping("/api/traceability")
@CrossOrigin(origins = "*")
public class TraceabilityController {

    private final TraceabilityService service;
    private final TraceabilityRecordRepository recordRepository;

    public TraceabilityController(TraceabilityService service, 
                                 TraceabilityRecordRepository recordRepository) {
        this.service = service;
        this.recordRepository = recordRepository;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody TraceabilityDTO dto,
        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "anonymous";
            return ResponseEntity.ok(service.createRecord(dto, username));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAll(
        @RequestParam(required=false) String producteur,
        @RequestParam(required=false) String lot,
        @RequestParam(required=false) String dateDebut,
        @RequestParam(required=false) String dateFin,
        @RequestParam(defaultValue="0") int page,
        @RequestParam(defaultValue="20") int size) {
        long startTime = System.currentTimeMillis();
        try {
            Object result = service.getAll(producteur, lot, dateDebut, dateFin, page, size);
            long responseTime = System.currentTimeMillis() - startTime;
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Response-Time", responseTime + "ms");
            return ResponseEntity.ok().headers(headers).body(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found")));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
        @RequestBody TraceabilityDTO dto,
        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "anonymous";
            return ResponseEntity.ok(service.updateRecord(id, dto, username));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<?> history(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.getHistory(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportExcel(
        @RequestParam(required=false) String producteur,
        @RequestParam(required=false) String lot,
        @RequestParam(required=false) String dateDebut,
        @RequestParam(required=false) String dateFin) throws Exception {
        
        long count = service.countRecords(producteur, dateDebut, dateFin);
        byte[] data = service.exportToExcel(producteur, lot, dateDebut, dateFin);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        
        if (count > 10000) {
            // Compressed response
            headers.set("Content-Disposition", "attachment; filename=traceabilite.xlsx.gz");
            headers.set("Content-Encoding", "gzip");
        } else {
            headers.set("Content-Disposition", "attachment; filename=traceabilite.xlsx");
        }
        
        return ResponseEntity.ok().headers(headers).body(data);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        try {
            return ResponseEntity.ok(service.getStats());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    @PostMapping("/stress-test")
    public ResponseEntity<String> stressTest(
        @RequestParam(defaultValue="1000") int count) {
        long start = System.currentTimeMillis();
        
        for (int i = 0; i < count; i++) {
            TraceabilityDTO dto = new TraceabilityDTO();
            dto.setProducteur("Producteur-" + (i % 100));
            dto.setParcelle("Parcelle-" + (i % 50));
            dto.setDateRecolte("2026-0" + (i%9+1) + "-" + String.format("%02d",i%28+1));
            dto.setDestination("Destination-" + (i % 20));
            dto.setStatut("BROUILLON");
            dto.setTraceabilityLotCode("TLC-STRESS-" + i);
            try {
                service.createRecord(dto, "stress-test");
            } catch (Exception e) {
                // Continue on error for stress test
            }
        }
        
        long duration = System.currentTimeMillis() - start;
        double avg = (double) duration / count;
        
        return ResponseEntity.ok(String.format(
            "{\"records_inserted\":%d,\"total_ms\":%d,\"avg_ms_per_record\":%.2f,\"target_met\":%b}",
            count, duration, avg, avg < 300
        ));
    }

    @PostMapping("/{id}/upload-document")
    public ResponseEntity<?> uploadDocument(
            @PathVariable Long id,
            @RequestParam(value = "document", required = false) MultipartFile documentFile,
            @RequestParam(value = "signature", required = false) MultipartFile signatureFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String username = userDetails != null ? userDetails.getUsername() : "anonymous";
            TraceabilityRecord updated = service.uploadDocument(id, documentFile, signatureFile, username);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Erreur lors de l'upload: " + e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.status(400).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erreur serveur: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/document")
    public ResponseEntity<Resource> getDocument(@PathVariable Long id) throws IOException {
        try {
            byte[] documentBytes = service.getDocument(id);
            TraceabilityRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enregistrement non trouvé"));

            ByteArrayResource resource = new ByteArrayResource(documentBytes);
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "attachment; filename=\"" + record.getDocumentFileName() + "\"")
                .contentType(MediaType.parseMediaType(record.getDocumentFileType()))
                .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
    }

    @GetMapping("/{id}/signature")
    public ResponseEntity<Resource> getSignature(@PathVariable Long id) {
        try {
            byte[] signatureBytes = service.getSignature(id);
            TraceabilityRecord record = recordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enregistrement non trouvé"));

            ByteArrayResource resource = new ByteArrayResource(signatureBytes);
            
            // Déterminer le type MIME correct pour l'image de signature
            String contentType = "image/jpeg"; // défaut
            if (record.getSignatureFileName() != null) {
                if (record.getSignatureFileName().toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                }
            }
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                    "inline; filename=\"" + record.getSignatureFileName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(null);
        }
    }
}
