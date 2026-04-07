package com.smartexport.platform.controller;

import com.smartexport.platform.carbon.CarbonCalculationService;
import com.smartexport.platform.carbon.dto.CarbonRequestDTO;
import com.smartexport.platform.carbon.dto.CarbonResponseDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/carbon")
public class CarbonController {

    private final CarbonCalculationService carbonCalculationService;

    public CarbonController(CarbonCalculationService carbonCalculationService) {
        this.carbonCalculationService = carbonCalculationService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<CarbonResponseDTO> calculate(@RequestBody CarbonRequestDTO request) {
        CarbonResponseDTO response = carbonCalculationService.calculate(request);
        return ResponseEntity.ok(response);
    }
}
