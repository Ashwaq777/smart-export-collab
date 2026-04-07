package com.smartexport.platform.service;

import com.smartexport.platform.dto.LandedCostCalculationDto;
import com.smartexport.platform.dto.LandedCostResultDto;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.entity.TarifDouanier;
import com.smartexport.platform.repository.PortRepository;
import com.smartexport.platform.repository.TarifDouanierRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CalculationServiceTest {

    @Mock
    private TarifDouanierRepository tarifRepository;

    @Mock
    private PortRepository portRepository;

    @Mock
    private ExchangeRateService exchangeRateService;

    @InjectMocks
    private CalculationService calculationService;

    private TarifDouanier tarifDouanier;
    private Port port;

    @BeforeEach
    void setUp() {
        tarifDouanier = new TarifDouanier();
        tarifDouanier.setId(1L);
        tarifDouanier.setCodeHs("0702.00");
        tarifDouanier.setNomProduit("Tomates");
        tarifDouanier.setCategorie("Légumes");
        tarifDouanier.setPaysDestination("France");
        tarifDouanier.setTauxDouane(new BigDecimal("10.40"));
        tarifDouanier.setTauxTva(new BigDecimal("20.00"));
        tarifDouanier.setTaxeParafiscale(new BigDecimal("0.00"));

        port = new Port();
        port.setId(1L);
        port.setNomPort("Marseille");
        port.setPays("France");
        port.setTypePort("Maritime");
        port.setFraisPortuaires(new BigDecimal("380.00"));
    }

    @Test
    void testCalculateLandedCost_WithoutPort() {
        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("France");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("EUR");
        request.setPortId(null);

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.of(tarifDouanier));

        LandedCostResultDto result = calculationService.calculateLandedCost(request);

        assertNotNull(result);
        assertEquals("Tomates", result.getNomProduit());
        assertEquals("0702.00", result.getCodeHs());
        assertEquals("France", result.getPaysDestination());
        
        assertEquals(new BigDecimal("1150.00"), result.getValeurCaf());
        
        assertEquals(new BigDecimal("119.60"), result.getMontantDouane());
        
        BigDecimal baseCalculTva = new BigDecimal("1150.00").add(new BigDecimal("119.60"));
        assertEquals(new BigDecimal("253.92"), result.getMontantTva());
        
        assertEquals(BigDecimal.ZERO, result.getMontantTaxeParafiscale());
        
        assertNull(result.getNomPort());
        assertEquals(BigDecimal.ZERO, result.getFraisPortuaires());
        
        assertEquals(new BigDecimal("1523.52"), result.getCoutTotal());
    }

    @Test
    void testCalculateLandedCost_WithPort() {
        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("France");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("EUR");
        request.setPortId(1L);

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.of(tarifDouanier));
        when(portRepository.findById(1L))
            .thenReturn(Optional.of(port));

        LandedCostResultDto result = calculationService.calculateLandedCost(request);

        assertNotNull(result);
        assertEquals("Marseille", result.getNomPort());
        assertEquals(new BigDecimal("380.00"), result.getFraisPortuaires());
        
        assertEquals(new BigDecimal("1903.52"), result.getCoutTotal());
    }

    @Test
    void testCalculateLandedCost_WithParafiscalTax() {
        tarifDouanier.setPaysDestination("Maroc");
        tarifDouanier.setTaxeParafiscale(new BigDecimal("0.25"));

        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("Maroc");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("MAD");
        request.setPortId(null);

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.of(tarifDouanier));

        LandedCostResultDto result = calculationService.calculateLandedCost(request);

        assertNotNull(result);
        assertEquals(new BigDecimal("2.88"), result.getMontantTaxeParafiscale());
        assertTrue(result.getCoutTotal().compareTo(new BigDecimal("1526.40")) == 0);
    }

    @Test
    void testCalculateLandedCost_USAWithZeroTVA() {
        tarifDouanier.setPaysDestination("USA");
        tarifDouanier.setTauxDouane(new BigDecimal("2.80"));
        tarifDouanier.setTauxTva(new BigDecimal("0.00"));
        tarifDouanier.setTaxeParafiscale(new BigDecimal("0.00"));

        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("USA");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("USD");
        request.setPortId(null);

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.of(tarifDouanier));

        LandedCostResultDto result = calculationService.calculateLandedCost(request);

        assertNotNull(result);
        assertEquals("USA", result.getPaysDestination());
        assertEquals(new BigDecimal("32.20"), result.getMontantDouane());
        assertEquals(BigDecimal.ZERO, result.getMontantTva());
        assertEquals(BigDecimal.ZERO, result.getMontantTaxeParafiscale());
        assertEquals(new BigDecimal("1182.20"), result.getCoutTotal());
    }

    @Test
    void testCalculateLandedCost_TarifNotFound() {
        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("9999.99");
        request.setPaysDestination("Unknown");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("EUR");

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            calculationService.calculateLandedCost(request);
        });
    }

    @Test
    void testCalculateLandedCost_WithPortAndUSA() {
        Port usPort = new Port();
        usPort.setId(2L);
        usPort.setNomPort("New York");
        usPort.setPays("USA");
        usPort.setTypePort("Maritime");
        usPort.setFraisPortuaires(new BigDecimal("550.00"));

        tarifDouanier.setPaysDestination("USA");
        tarifDouanier.setTauxDouane(new BigDecimal("2.80"));
        tarifDouanier.setTauxTva(new BigDecimal("0.00"));
        tarifDouanier.setTaxeParafiscale(new BigDecimal("0.00"));

        LandedCostCalculationDto request = new LandedCostCalculationDto();
        request.setCodeHs("0702.00");
        request.setPaysDestination("USA");
        request.setValeurFob(new BigDecimal("1000.00"));
        request.setCoutTransport(new BigDecimal("100.00"));
        request.setAssurance(new BigDecimal("50.00"));
        request.setCurrency("USD");
        request.setPortId(2L);

        when(tarifRepository.findByCodeHsAndPaysDestination(anyString(), anyString()))
            .thenReturn(Optional.of(tarifDouanier));
        when(portRepository.findById(2L))
            .thenReturn(Optional.of(usPort));

        LandedCostResultDto result = calculationService.calculateLandedCost(request);

        assertNotNull(result);
        assertEquals("New York", result.getNomPort());
        assertEquals(new BigDecimal("550.00"), result.getFraisPortuaires());
        assertEquals(new BigDecimal("1732.20"), result.getCoutTotal());
    }
}
