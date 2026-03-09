package com.smartexport.platform.controller;

import com.smartexport.platform.dto.ForexConversionDto;
import com.smartexport.platform.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forex")
@RequiredArgsConstructor
public class ForexController {
    
    private final ExchangeRateService exchangeRateService;
    
    @GetMapping("/convert")
    public ResponseEntity<ForexConversionDto> convertCurrency(
            @RequestParam BigDecimal amount,
            @RequestParam String from,
            @RequestParam String to) {
        
        ForexConversionDto result = exchangeRateService.convert(amount, from.toUpperCase(), to.toUpperCase());
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/rate")
    public ResponseEntity<BigDecimal> getExchangeRate(
            @RequestParam String from,
            @RequestParam String to) {
        
        BigDecimal rate = exchangeRateService.getRate(from.toUpperCase(), to.toUpperCase());
        return ResponseEntity.ok(rate);
    }
    
    @GetMapping("/rates")
    public ResponseEntity<List<Map<String, Object>>> getAllExchangeRates() {
        List<Map<String, Object>> rates = exchangeRateService.getAllRates();
        return ResponseEntity.ok(rates);
    }
}
