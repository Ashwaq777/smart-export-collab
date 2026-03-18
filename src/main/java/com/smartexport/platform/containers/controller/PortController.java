package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.PortDTO;
import com.smartexport.platform.containers.service.PortService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("containerPortController")
@RequestMapping("/api/v1/containers/ports")
@Tag(name = "Ports", description = "World maritime ports search")
public class PortController {

    private final PortService portService;

    public PortController(@Qualifier("containerPortService") PortService portService) {
        this.portService = portService;
    }

    // GET /search?q=Rotterdam
    @GetMapping("/search")
    @Operation(summary = "Search maritime ports worldwide")
    public ResponseEntity<ContainerApiResponse<List<PortDTO>>>
            searchPorts(@RequestParam String q) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(portService.searchPorts(q)));
    }

    // GET /country?code=MA
    @GetMapping("/country")
    @Operation(summary = "Search ports by country code ISO 3166-1 alpha-2")
    public ResponseEntity<ContainerApiResponse<List<PortDTO>>>
            searchByCountry(@RequestParam String code) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                portService.searchPortsByCountry(code)));
    }

    // GET /validate?address=Port of Rotterdam
    @GetMapping("/validate")
    @Operation(summary = "Validate if address is a maritime port")
    public ResponseEntity<ContainerApiResponse<Boolean>>
            validate(@RequestParam String address) {
        return ResponseEntity.ok(
            ContainerApiResponse.success(
                portService.validateIsPort(address)));
    }
}
