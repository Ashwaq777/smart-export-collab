package com.smartexport.platform.vessels.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.vessels.dto.VesselPositionDTO;
import com.smartexport.platform.vessels.service.VesselAlertService;
import com.smartexport.platform.vessels.service.VesselDistanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/vessels")
@Tag(name = "Vessel Tracking")
@RequiredArgsConstructor
public class VesselController {

    private final VesselDistanceService distanceService;
    private final VesselAlertService alertService;

    @GetMapping("/{imo}")
    @Operation(summary = "Get real-time vessel position by IMO")
    public ResponseEntity<ContainerApiResponse<VesselPositionDTO>>
            getVessel(@PathVariable String imo) {
        try {
            VesselPositionDTO vessel = 
                distanceService.getVesselPosition(imo).block();
            if (vessel == null) {
                return ResponseEntity.status(404)
                    .body(ContainerApiResponse.error(
                        "Vessel not found: " + imo));
            }
            return ResponseEntity.ok(
                ContainerApiResponse.success(vessel));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ContainerApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{imo}/distance")
    @Operation(summary = "Get distance between vessel and port")
    public ResponseEntity<ContainerApiResponse<Map<String, Object>>>
            getDistance(@PathVariable String imo,
                        @RequestParam String port) {
        try {
            Map<String, Object> result = 
                alertService.checkAndAlert(imo, port, null).block();
            return ResponseEntity.ok(
                ContainerApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ContainerApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/track")
    @Operation(summary = "Track vessel and send alert if near port")
    public ResponseEntity<ContainerApiResponse<Map<String, Object>>>
            trackVessel(@RequestBody Map<String, String> request) {
        try {
            String imo = request.get("imo");
            String port = request.get("place");
            String email = request.get("email");
            if (imo == null || port == null) {
                return ResponseEntity.badRequest()
                    .body(ContainerApiResponse.error(
                        "imo and place required"));
            }
            Map<String, Object> result = 
                alertService.checkAndAlert(imo, port, email).block();
            return ResponseEntity.ok(
                ContainerApiResponse.success(result));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(ContainerApiResponse.error(e.getMessage()));
        }
    }
}
