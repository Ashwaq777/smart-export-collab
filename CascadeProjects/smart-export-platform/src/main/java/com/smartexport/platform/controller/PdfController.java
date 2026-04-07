package com.smartexport.platform.controller;

import com.smartexport.platform.dto.LandedCostCalculationDto;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.service.CalculationService;
import com.smartexport.platform.service.PdfGenerationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PdfController {
    
    private final CalculationService calculationService;
    private final PdfGenerationService pdfGenerationService;
    
    @PostMapping("/landed-cost")
    public ResponseEntity<byte[]> generateLandedCostPdf(
            @Valid @RequestBody LandedCostCalculationDto request) {
        
        LandedCostResultDto result = calculationService.calculateLandedCost(request);
        
        byte[] pdfBytes = pdfGenerationService.generateLandedCostPdf(result);
        
        String filename = "landed_cost_" + result.getCodeHs().replace(".", "_") + ".pdf";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
        
        return ResponseEntity.ok()
            .headers(headers)
            .body(pdfBytes);
    }
}
