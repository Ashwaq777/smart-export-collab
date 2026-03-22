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
    
    public static class MaritimeTransportCostRequest {
        private String vesselMmsi;
        private String vesselName;
        private Long originPortId;
        private Long destPortId;
        private BigDecimal weightTonnes;
        private String containerType;
        private String incoterm;
        private BigDecimal fobValue;
        
        // Constructors
        public MaritimeTransportCostRequest() {}
        
        public MaritimeTransportCostRequest(
            String vesselMmsi, String vesselName, Long originPortId, Long destPortId,
            BigDecimal weightTonnes, String containerType, String incoterm, BigDecimal fobValue) {
            
            this.vesselMmsi = vesselMmsi;
            this.vesselName = vesselName;
            this.originPortId = originPortId;
            this.destPortId = destPortId;
            this.weightTonnes = weightTonnes;
            this.containerType = containerType;
            this.incoterm = incoterm;
            this.fobValue = fobValue;
        }
        
        // Getters and Setters
        public String getVesselMmsi() { return vesselMmsi; }
        public void setVesselMmsi(String vesselMmsi) { this.vesselMmsi = vesselMmsi; }
        
        public String getVesselName() { return vesselName; }
        public void setVesselName(String vesselName) { this.vesselName = vesselName; }
        
        public Long getOriginPortId() { return originPortId; }
        public void setOriginPortId(Long originPortId) { this.originPortId = originPortId; }
        
        public Long getDestPortId() { return destPortId; }
        public void setDestPortId(Long destPortId) { this.destPortId = destPortId; }
        
        public BigDecimal getWeightTonnes() { return weightTonnes; }
        public void setWeightTonnes(BigDecimal weightTonnes) { this.weightTonnes = weightTonnes; }
        
        public String getContainerType() { return containerType; }
        public void setContainerType(String containerType) { this.containerType = containerType; }
        
        public String getIncoterm() { return incoterm; }
        public void setIncoterm(String incoterm) { this.incoterm = incoterm; }
        
        public BigDecimal getFobValue() { return fobValue; }
        public void setFobValue(BigDecimal fobValue) { this.fobValue = fobValue; }
    }
    
    public static class DistanceResponse {
        public String dataSource;
        public BigDecimal distanceNm;
        public BigDecimal distanceKm;
        
        public DistanceResponse() {}
        
        public DistanceResponse(String dataSource, BigDecimal distanceNm, BigDecimal distanceKm) {
            this.dataSource = dataSource;
            this.distanceNm = distanceNm;
            this.distanceKm = distanceKm;
        }
    }

    public static class FreightRateResponse {
        public BigDecimal unitRate;
        
        public FreightRateResponse() {}
        
        public FreightRateResponse(BigDecimal unitRate) {
            this.unitRate = unitRate;
        }
    }
}
