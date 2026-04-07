package com.smartexport.platform.service;

import com.smartexport.platform.dto.PortDto;
import com.smartexport.platform.entity.Port;
import com.smartexport.platform.repository.PortRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortService {
    
    private final PortRepository portRepository;
    
    @Transactional(readOnly = true)
    public List<PortDto> getAllPorts() {
        return portRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PortDto getPortById(Long id) {
        Port port = portRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Port non trouvé avec l'ID: " + id));
        return convertToDto(port);
    }
    
    @Transactional(readOnly = true)
    public List<PortDto> getPortsByPays(String pays) {
        return portRepository.findByPays(pays).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PortDto> getPortsByTypePort(String typePort) {
        return portRepository.findByTypePort(typePort).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public PortDto createPort(PortDto portDto) {
        Port port = convertToEntity(portDto);
        Port savedPort = portRepository.save(port);
        return convertToDto(savedPort);
    }
    
    @Transactional
    public PortDto updatePort(Long id, PortDto portDto) {
        Port existingPort = portRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Port non trouvé avec l'ID: " + id));
        
        existingPort.setNomPort(portDto.getNomPort());
        existingPort.setPays(portDto.getPays());
        existingPort.setTypePort(portDto.getTypePort());
        existingPort.setFraisPortuaires(portDto.getFraisPortuaires());
        
        Port updatedPort = portRepository.save(existingPort);
        return convertToDto(updatedPort);
    }
    
    @Transactional
    public void deletePort(Long id) {
        if (!portRepository.existsById(id)) {
            throw new RuntimeException("Port non trouvé avec l'ID: " + id);
        }
        portRepository.deleteById(id);
    }
    
    private PortDto convertToDto(Port port) {
        PortDto dto = new PortDto();
        dto.setId(port.getId());
        dto.setNomPort(port.getNomPort());
        dto.setPays(port.getPays());
        dto.setTypePort(port.getTypePort());
        dto.setFraisPortuaires(port.getFraisPortuaires());
        return dto;
    }
    
    private Port convertToEntity(PortDto dto) {
        Port port = new Port();
        port.setNomPort(dto.getNomPort());
        port.setPays(dto.getPays());
        port.setTypePort(dto.getTypePort());
        port.setFraisPortuaires(dto.getFraisPortuaires());
        return port;
    }
}
