package com.smartexport.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexport.platform.dto.LandedCostCalculationDto;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.service.CalculationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalculationController.class)
class CalculationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CalculationService calculationService;

    @Test
    void testCalculateLandedCost_Success() throws Exception {
        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("France");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("EUR");
        request.setPortId(1L);

        LandedCostResultDto result = LandedCostResultDto.builder()
            .codeHs("0702.00")
            .nomProduit("Tomates")
            .paysDestination("France")
            .valeurFob(new BigDecimal("1000.00"))
            .coutTransport(new BigDecimal("100.00"))
            .assurance(new BigDecimal("50.00"))
            .valeurCaf(new BigDecimal("1150.00"))
            .tauxDouane(new BigDecimal("10.40"))
            .montantDouane(new BigDecimal("119.60"))
            .tauxTva(new BigDecimal("20.00"))
            .montantTva(new BigDecimal("253.92"))
            .taxeParafiscale(new BigDecimal("0.00"))
            .montantTaxeParafiscale(new BigDecimal("0.00"))
            .nomPort("Marseille")
            .fraisPortuaires(new BigDecimal("380.00"))
            .coutTotal(new BigDecimal("1903.52"))
            .coutEstime(new BigDecimal("1150.00"))
            .varianceCout(new BigDecimal("753.52"))
            .variancePercentage("65.52%")
            .currency("EUR")
            .disclaimer("Estimation non contractuelle. Les taux peuvent varier.")
            .exchangeRateSource("ExchangeRate-API")
            .calculationDate(LocalDateTime.now())
            .build();

        when(calculationService.calculateLandedCost(any(LandedCostCalculationDto.class)))
            .thenReturn(result);

        mockMvc.perform(post("/api/calculation/landed-cost")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.codeHs").value("0702.00"))
            .andExpect(jsonPath("$.nomProduit").value("Tomates"))
            .andExpect(jsonPath("$.paysDestination").value("France"))
            .andExpect(jsonPath("$.valeurCaf").value(1150.00))
            .andExpect(jsonPath("$.montantDouane").value(119.60))
            .andExpect(jsonPath("$.montantTva").value(253.92))
            .andExpect(jsonPath("$.nomPort").value("Marseille"))
            .andExpect(jsonPath("$.fraisPortuaires").value(380.00))
            .andExpect(jsonPath("$.coutTotal").value(1903.52))
            .andExpect(jsonPath("$.currency").value("EUR"));
    }

    @Test
    void testCalculateLandedCost_WithUSA() throws Exception {
        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("USA");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("USD");
        request.setPortId(2L);

        LandedCostResultDto result = LandedCostResultDto.builder()
            .codeHs("0702.00")
            .nomProduit("Tomates")
            .paysDestination("USA")
            .valeurFob(new BigDecimal("1000.00"))
            .coutTransport(new BigDecimal("100.00"))
            .assurance(new BigDecimal("50.00"))
            .valeurCaf(new BigDecimal("1150.00"))
            .tauxDouane(new BigDecimal("2.80"))
            .montantDouane(new BigDecimal("32.20"))
            .tauxTva(new BigDecimal("0.00"))
            .montantTva(new BigDecimal("0.00"))
            .taxeParafiscale(new BigDecimal("0.00"))
            .montantTaxeParafiscale(new BigDecimal("0.00"))
            .nomPort("New York")
            .fraisPortuaires(new BigDecimal("550.00"))
            .coutTotal(new BigDecimal("1732.20"))
            .coutEstime(new BigDecimal("1150.00"))
            .varianceCout(new BigDecimal("582.20"))
            .variancePercentage("50.63%")
            .currency("USD")
            .coutTotalEur(new BigDecimal("1590.50"))
            .disclaimer("Estimation non contractuelle. Les taux peuvent varier.")
            .exchangeRateSource("ExchangeRate-API")
            .calculationDate(LocalDateTime.now())
            .build();

        when(calculationService.calculateLandedCost(any(LandedCostCalculationDto.class)))
            .thenReturn(result);

        mockMvc.perform(post("/api/calculation/landed-cost")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.paysDestination").value("USA"))
            .andExpect(jsonPath("$.montantDouane").value(32.20))
            .andExpect(jsonPath("$.montantTva").value(0.00))
            .andExpect(jsonPath("$.nomPort").value("New York"))
            .andExpect(jsonPath("$.fraisPortuaires").value(550.00))
            .andExpect(jsonPath("$.coutTotal").value(1732.20))
            .andExpect(jsonPath("$.currency").value("USD"))
            .andExpect(jsonPath("$.coutTotalEur").value(1590.50));
    }

    @Test
    void testCalculateLandedCost_InvalidRequest() throws Exception {
        LandedCostCalculationDto invalidRequest = new LandedCostCalculationDto();
        invalidRequest.setCodeHs("");
        invalidRequest.setPaysDestination("");
        invalidRequest.setValeurFob(new BigDecimal("-100.00"));

        mockMvc.perform(post("/api/calculation/landed-cost")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
            .andExpect(status().isBadRequest());
    }
}
