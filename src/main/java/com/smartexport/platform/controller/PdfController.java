package com.smartexport.platform.controller;

import com.smartexport.platform.dto.LandedCostCalculationDto;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.dto.ImportLandedCostDto;
import com.smartexport.platform.dto.ImportLandedCostResultDto;
import com.smartexport.platform.service.CalculationService;
import com.smartexport.platform.service.ImportCalculationService;
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
    private final ImportCalculationService importCalculationService;
    private final PdfGenerationService pdfGenerationService;
    
    @PostMapping("/landed-cost")
    public ResponseEntity<byte[]> generateLandedCostPdf(
            @Valid @RequestBody LandedCostCalculationDto request) {
        try {
            LandedCostResultDto result = calculationService.calculateLandedCost(request);
            byte[] pdfBytes = pdfGenerationService.generateLandedCostPdf(result);
            String filename = "landed_cost_" + result.getCodeHs().replace(".", "_") + ".pdf";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(("PDF Error: " + e.getMessage()).getBytes());
        }
    }
    
    @PostMapping("/import-landed-cost")
    public ResponseEntity<byte[]> generateImportLandedCostPdf(
            @Valid @RequestBody ImportLandedCostDto request) {
        try {
            ImportLandedCostResultDto result = importCalculationService.calculateImportLandedCost(request);
            byte[] pdfBytes = pdfGenerationService.generateImportLandedCostPdf(result);
            String filename = "import_landed_cost_" + request.getCodeHs().replace(".", "_") + ".pdf";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");
            return ResponseEntity.ok().headers(headers).body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(("PDF Error: " + e.getMessage()).getBytes());
        }
    }
}
