package com.smartexport.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartexport.platform.dto.PortDto;
import com.smartexport.platform.service.PortService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PortController.class)
class PortControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PortService portService;

    @Test
    void testGetAllPorts() throws Exception {
        PortDto port1 = new PortDto(1L, "Rotterdam", "Pays-Bas", "Maritime", new BigDecimal("450.00"));
        PortDto port2 = new PortDto(2L, "Hambourg", "Allemagne", "Maritime", new BigDecimal("420.00"));
        List<PortDto> ports = Arrays.asList(port1, port2);

        when(portService.getAllPorts()).thenReturn(ports);

        mockMvc.perform(get("/api/ports"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].nomPort").value("Rotterdam"))
            .andExpect(jsonPath("$[1].nomPort").value("Hambourg"));
    }

    @Test
    void testGetPortsByCountry() throws Exception {
        PortDto port1 = new PortDto(1L, "New York", "USA", "Maritime", new BigDecimal("550.00"));
        PortDto port2 = new PortDto(2L, "Los Angeles", "USA", "Maritime", new BigDecimal("520.00"));
        List<PortDto> ports = Arrays.asList(port1, port2);

        when(portService.getPortsByPays("USA")).thenReturn(ports);

        mockMvc.perform(get("/api/ports")
                .param("pays", "USA"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$.length()").value(2))
            .andExpect(jsonPath("$[0].pays").value("USA"))
            .andExpect(jsonPath("$[1].pays").value("USA"));
    }

    @Test
    void testGetPortById() throws Exception {
        PortDto port = new PortDto(1L, "Marseille", "France", "Maritime", new BigDecimal("380.00"));

        when(portService.getPortById(1L)).thenReturn(port);

        mockMvc.perform(get("/api/ports/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.nomPort").value("Marseille"))
            .andExpect(jsonPath("$.pays").value("France"))
            .andExpect(jsonPath("$.typePort").value("Maritime"))
            .andExpect(jsonPath("$.fraisPortuaires").value(380.00));
    }

    @Test
    void testCreatePort() throws Exception {
        PortDto newPort = new PortDto(null, "Miami", "USA", "Maritime", new BigDecimal("500.00"));
        PortDto savedPort = new PortDto(3L, "Miami", "USA", "Maritime", new BigDecimal("500.00"));

        when(portService.createPort(any(PortDto.class))).thenReturn(savedPort);

        mockMvc.perform(post("/api/ports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newPort)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(3))
            .andExpect(jsonPath("$.nomPort").value("Miami"))
            .andExpect(jsonPath("$.pays").value("USA"));
    }

    @Test
    void testUpdatePort() throws Exception {
        PortDto updatedPort = new PortDto(1L, "Rotterdam Updated", "Pays-Bas", "Maritime", new BigDecimal("460.00"));

        when(portService.updatePort(eq(1L), any(PortDto.class))).thenReturn(updatedPort);

        mockMvc.perform(put("/api/ports/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedPort)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nomPort").value("Rotterdam Updated"))
            .andExpect(jsonPath("$.fraisPortuaires").value(460.00));
    }

    @Test
    void testDeletePort() throws Exception {
        mockMvc.perform(delete("/api/ports/1"))
            .andExpect(status().isNoContent());
    }

    @Test
    void testCreatePort_InvalidData() throws Exception {
        PortDto invalidPort = new PortDto(null, "", "", "InvalidType", new BigDecimal("-100.00"));

        mockMvc.perform(post("/api/ports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidPort)))
            .andExpect(status().isBadRequest());
    }
}
