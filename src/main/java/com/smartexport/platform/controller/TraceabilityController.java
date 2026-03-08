package com.smartexport.platform.controller;

import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
        try {
            return ResponseEntity.ok(service.getAll(producteur, lot, dateDebut, dateFin, page, size));
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
    public ResponseEntity<byte[]> export(
        @RequestParam(required=false) String producteur,
        @RequestParam(required=false) String lot,
        @RequestParam(required=false) String dateDebut,
        @RequestParam(required=false) String dateFin) {
        try {
            byte[] excel = service.exportToExcel(producteur, lot, dateDebut, dateFin);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", "traceabilite.xlsx");
            return ResponseEntity.ok().headers(headers).body(excel);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        try {
            return ResponseEntity.ok(service.getStats());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
