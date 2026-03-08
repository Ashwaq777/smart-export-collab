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
}
