package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerRequestDTO;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContainerRequestService {

    private final ContainerRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final ContainerMatchRepository matchRepository;
    private final ContainerTransactionRepository transactionRepository;
    private final GeocodingService geocodingService;
    private final PortService portService;

    public ContainerRequestService(ContainerRequestRepository requestRepository,
                                   UserRepository userRepository,
                                   ContainerMatchRepository matchRepository,
                                   ContainerTransactionRepository transactionRepository,
                                   GeocodingService geocodingService,
                                   @Qualifier("containerPortService") PortService portService) {
        this.requestRepository = requestRepository;
        this.userRepository = userRepository;
        this.matchRepository = matchRepository;
        this.transactionRepository = transactionRepository;
        this.geocodingService = geocodingService;
        this.portService = portService;
    }

    public ContainerRequestDTO createRequest(ContainerRequestDTO dto,
                                             Long seekerId) {
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "User not found: " + seekerId));
        ContainerRequest request = new ContainerRequest();
        request.setSeeker(seeker);
        request.setContainerType(dto.getContainerType());
        request.setCargoType(dto.getCargoType());
        request.setSize(dto.getSize());
        request.setLoadingLocation(dto.getLoadingLocation());
        
        // Auto-geocode using PortService if coordinates not provided
        if (dto.getLoadingLatitude() == null || dto.getLoadingLongitude() == null) {
            portService.getPortDetails(dto.getLoadingLocation()).ifPresent(port -> {
                request.setLoadingLatitude(port.getLatitude());
                request.setLoadingLongitude(port.getLongitude());
            });
            // Fallback to GeocodingService if PortService returns empty
            if (request.getLoadingLatitude() == null) {
                geocodingService.geocode(dto.getLoadingLocation()).ifPresent(result -> {
                    request.setLoadingLatitude(result.getLatitude());
                    request.setLoadingLongitude(result.getLongitude());
                });
            }
        } else {
            request.setLoadingLatitude(dto.getLoadingLatitude());
            request.setLoadingLongitude(dto.getLoadingLongitude());
        }
        
        request.setRequiredDate(dto.getRequiredDate());
        request.setStatus(ContainerRequestStatus.SEARCHING);
        ContainerRequest saved = requestRepository.save(request);
        return mapToDTO(saved);
    }

    public List<ContainerRequestDTO> getRequestsBySeeker(Long seekerId) {
        return requestRepository.findBySeekerId(seekerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ContainerRequestDTO getRequestById(Long requestId) {
        ContainerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Request not found: " + requestId));
        return mapToDTO(request);
    }

    public ContainerRequestDTO updateRequest(Long id, 
                                          ContainerRequestDTO dto, 
                                          Long userId) {
        ContainerRequest request = requestRepository.findById(id)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Request not found: " + id));
        
        Long seekerId = request.getSeeker().getId();
        System.err.println("UPDATE CHECK - Request " + id + " owned by " + seekerId + ", user " + userId);
        
        if (seekerId == null || userId == null || !seekerId.equals(userId)) {
            System.err.println("UPDATE FAILED - User " + userId + " tried to update request " + id + " owned by " + seekerId);
            throw new UnauthorizedContainerAccessException(
                "Not authorized");
        }
        System.out.println("UPDATE SUCCESS - User " + userId + " updating request " + id + " owned by " + seekerId);
        if (dto.getLoadingLocation() != null)
            request.setLoadingLocation(dto.getLoadingLocation());
        if (dto.getContainerType() != null)
            request.setContainerType(dto.getContainerType());
        if (dto.getCargoType() != null)
            request.setCargoType(dto.getCargoType());
        if (dto.getRequiredDate() != null)
            request.setRequiredDate(dto.getRequiredDate());
        return mapToDTO(requestRepository.save(request));
    }

    public void updateRequestStatus(Long requestId,
                                   ContainerRequestStatus status,
                                   Long userId) {
        ContainerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Request not found: " + requestId));
        if (!request.getSeeker().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not the owner of request " + requestId);
        }
        request.setStatus(status);
        requestRepository.save(request);
    }

    public void deleteRequest(Long requestId, Long userId) {
        ContainerRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Request not found: " + requestId));
        
        Long seekerId = request.getSeeker().getId();
        if (seekerId == null || !seekerId.equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "Not authorized to delete request: " + requestId);
        }
        
        // Delete associated transactions first
        List<ContainerMatch> matches = matchRepository.findByRequestId(requestId);
        for (ContainerMatch match : matches) {
            transactionRepository.findByMatch(match)
                .ifPresent(transactionRepository::delete);
        }
        
        // Delete matches
        matchRepository.deleteAll(matches);
        
        // Now safe to delete request
        requestRepository.delete(request);
    }

    private ContainerRequestDTO mapToDTO(ContainerRequest request) {
        ContainerRequestDTO dto = new ContainerRequestDTO();
        dto.setId(request.getId());
        dto.setSeekerId(request.getSeeker().getId());
        dto.setSeekerName(request.getSeeker().getFirstName()
                + " " + request.getSeeker().getLastName());
        dto.setContainerType(request.getContainerType());
        dto.setCargoType(request.getCargoType());
        dto.setSize(request.getSize());
        dto.setLoadingLocation(request.getLoadingLocation());
        dto.setLoadingLatitude(request.getLoadingLatitude());
        dto.setLoadingLongitude(request.getLoadingLongitude());
        dto.setRequiredDate(request.getRequiredDate());
        dto.setStatus(request.getStatus());
        dto.setCreatedAt(request.getCreatedAt());
        return dto;
    }
}
