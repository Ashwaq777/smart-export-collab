package com.smartexport.platform.controller;

import com.smartexport.platform.dto.ForexConversionDto;
import com.smartexport.platform.service.ExchangeRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

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
}
