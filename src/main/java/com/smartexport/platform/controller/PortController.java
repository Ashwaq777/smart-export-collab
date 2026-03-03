package com.smartexport.platform.controller;

import com.smartexport.platform.dto.PortDto;
import com.smartexport.platform.service.PortService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PortController {
    
    private final PortService portService;
    
    @GetMapping
    public ResponseEntity<List<PortDto>> getAllPorts(
            @RequestParam(required = false) String pays,
            @RequestParam(required = false) String typePort) {
        
        List<PortDto> ports;
        
        if (pays != null && !pays.isEmpty()) {
            ports = portService.getPortsByPays(pays);
        } else if (typePort != null && !typePort.isEmpty()) {
            ports = portService.getPortsByTypePort(typePort);
        } else {
            ports = portService.getAllPorts();
        }
        
        return ResponseEntity.ok(ports);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PortDto> getPortById(@PathVariable Long id) {
        PortDto port = portService.getPortById(id);
        return ResponseEntity.ok(port);
    }
    
    @PostMapping
    public ResponseEntity<PortDto> createPort(@Valid @RequestBody PortDto portDto) {
        PortDto createdPort = portService.createPort(portDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPort);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PortDto> updatePort(
            @PathVariable Long id,
            @Valid @RequestBody PortDto portDto) {
        PortDto updatedPort = portService.updatePort(id, portDto);
        return ResponseEntity.ok(updatedPort);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePort(@PathVariable Long id) {
        portService.deletePort(id);
        return ResponseEntity.noContent().build();
    }
}
