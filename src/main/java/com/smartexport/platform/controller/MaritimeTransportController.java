package com.smartexport.platform.controller;

import com.smartexport.platform.dto.MaritimeTransportCostDto;
import com.smartexport.platform.service.DatalasticSeaRoutesService;
import com.smartexport.platform.service.MaritimeTransportService;
import com.smartexport.platform.service.VesselAisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/maritime")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MaritimeTransportController {
    
    private final MaritimeTransportService maritimeTransportService;
    
    /**
     * Get available vessels for a port using real-time AIS data
     */
    @GetMapping("/vessels/port/{portId}")
    public ResponseEntity<List<VesselAisService.VesselInfo>> getVesselsByPort(@PathVariable Long portId) {
        List<VesselAisService.VesselInfo> vessels = maritimeTransportService.getAvailableVessels(portId);
        return ResponseEntity.ok(vessels);
    }
    
    /**
     * Get distance between two ports using Datalastic API
     */
    @GetMapping("/distance/{originPortId}/{destPortId}")
    public ResponseEntity<DistanceResponse> getDistance(
            @PathVariable Long originPortId,
            @PathVariable Long destPortId) {

        DatalasticSeaRoutesService.SeaRouteResult route = maritimeTransportService.getSeaRouteDistance(originPortId, destPortId);

        return ResponseEntity.ok(new DistanceResponse(
            route.getDataSource(),
            route.getDistanceNm(),
            route.getDistanceKm()
        ));
    }

    /**
     * Get an estimated unit freight rate (USD/tonne/1000NM).
     * This endpoint exists so the frontend can retrieve a backend-driven rate and cache it.
     */
    @GetMapping("/freight-rate")
    public ResponseEntity<FreightRateResponse> getFreightRate(
            @RequestParam Long originPortId,
            @RequestParam Long destinationPortId,
            @RequestParam(required = false) String containerType,
            @RequestParam(required = false) String cargoCategory,
            @RequestParam(required = false) String incoterm) {

        BigDecimal unitRate = maritimeTransportService.estimateUnitRateUsdPerTonnePer1000Nm(
            originPortId,
            destinationPortId,
            containerType,
            cargoCategory,
            incoterm
        );

        return ResponseEntity.ok(new FreightRateResponse(unitRate));
    }
    
    /**
     * Calculate maritime transport cost with weight-based formula
     */
    @PostMapping("/calculate-cost")
    public ResponseEntity<MaritimeTransportCostDto> calculateCost(
            @RequestBody MaritimeTransportCostRequest request) {
        
        MaritimeTransportCostDto cost = maritimeTransportService.calculateTransportCost(
            request.getVesselMmsi(),
            request.getVesselName(),
            request.getOriginPortId(),
            request.getDestPortId(),
            request.getWeightTonnes(),
            request.getContainerType(),
            request.getIncoterm(),
            request.getFobValue()
        );
        
        return ResponseEntity.ok(cost);
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MaritimeTransportCostRequest {
        private String vesselMmsi;
        private String vesselName;
        private Long originPortId;
        private Long destPortId;
        private BigDecimal weightTonnes;
        private String containerType;
        private String incoterm;
        private BigDecimal fobValue;
    }
    
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class DistanceResponse {
        private String message;
        private BigDecimal distanceNm;
        private BigDecimal distanceKm;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class FreightRateResponse {
        private BigDecimal unitRate;
    }
}
