package com.smartexport.platform.service;

import com.smartexport.platform.dto.ExchangeRateResponse;
import com.smartexport.platform.dto.ForexConversionDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@Slf4j
public class ExchangeRateService {
    
    @Value("${exchangerate.api.key:demo}")
    private String apiKey;
    
    @Value("${exchangerate.api.url:https://v6.exchangerate-api.com/v6}")
    private String apiUrl;
    
    private final RestTemplate restTemplate;
    
    public ExchangeRateService() {
        this.restTemplate = new RestTemplate();
    }
    
    @Cacheable(value = "exchangeRates", key = "#baseCurrency")
    public ExchangeRateResponse fetchRates(String baseCurrency) {
        String url = String.format("%s/%s/latest/%s", apiUrl, apiKey, baseCurrency);
        
        try {
            log.info("Fetching exchange rates for {} from ExchangeRate-API", baseCurrency);
            ExchangeRateResponse response = restTemplate.getForObject(url, ExchangeRateResponse.class);
            
            if (response != null && "success".equals(response.getResult())) {
                log.info("Successfully fetched rates for {}", baseCurrency);
                return response;
            } else {
                log.warn("Failed to fetch rates, using fallback values");
                return getFallbackRates(baseCurrency);
            }
        } catch (Exception e) {
            log.error("Error calling ExchangeRate-API: {}", e.getMessage());
            return getFallbackRates(baseCurrency);
        }
    }
    
    public ForexConversionDto convert(BigDecimal amount, String fromCurrency, String toCurrency) {
        ExchangeRateResponse rates = fetchRates(fromCurrency);
        
        BigDecimal rate = rates.getConversionRates().get(toCurrency);
        if (rate == null) {
            throw new RuntimeException("Taux de change non disponible pour " + toCurrency);
        }
        
        BigDecimal convertedAmount = amount.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        
        return ForexConversionDto.builder()
            .amount(amount)
            .fromCurrency(fromCurrency)
            .toCurrency(toCurrency)
            .exchangeRate(rate)
            .convertedAmount(convertedAmount)
            .source("ExchangeRate-API")
            .timestamp(LocalDateTime.now())
            .build();
    }
    
    public BigDecimal getRate(String fromCurrency, String toCurrency) {
        ExchangeRateResponse rates = fetchRates(fromCurrency);
        
        if (rates == null || rates.getConversionRates() == null) {
            log.error("Exchange rates not available for {}", fromCurrency);
            throw new RuntimeException("Taux de change non disponible pour " + fromCurrency);
        }
        
        BigDecimal rate = rates.getConversionRates().get(toCurrency);
        
        if (rate == null) {
            log.error("Exchange rate not found for {} to {}", fromCurrency, toCurrency);
            throw new RuntimeException("Taux de change non disponible pour " + toCurrency);
        }
        
        return rate;
    }
    
    private ExchangeRateResponse getFallbackRates(String baseCurrency) {
        ExchangeRateResponse fallback = new ExchangeRateResponse();
        fallback.setResult("success");
        fallback.setBaseCode(baseCurrency);
        
        java.util.Map<String, BigDecimal> rates = new java.util.HashMap<>();
        
        if ("MAD".equals(baseCurrency)) {
            rates.put("EUR", BigDecimal.valueOf(0.092));
            rates.put("USD", BigDecimal.valueOf(0.10));
            rates.put("MAD", BigDecimal.ONE);
        } else if ("EUR".equals(baseCurrency)) {
            rates.put("MAD", BigDecimal.valueOf(10.80));
            rates.put("USD", BigDecimal.valueOf(1.10));
            rates.put("EUR", BigDecimal.ONE);
        } else if ("USD".equals(baseCurrency)) {
            rates.put("MAD", BigDecimal.valueOf(9.80));
            rates.put("EUR", BigDecimal.valueOf(0.91));
            rates.put("USD", BigDecimal.ONE);
        }
        
        fallback.setConversionRates(rates);
        fallback.setTimeLastUpdateUnix(System.currentTimeMillis() / 1000);
        
        return fallback;
    }
}
