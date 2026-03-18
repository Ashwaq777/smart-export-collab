package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerOfferDTO;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ContainerOfferService {

    private final ContainerOfferRepository offerRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final PortService portService;

    public ContainerOfferService(ContainerOfferRepository offerRepository,
                                  UserRepository userRepository,
                                  GeocodingService geocodingService,
                                  @Qualifier("containerPortService") PortService portService) {
        this.offerRepository = offerRepository;
        this.userRepository = userRepository;
        this.geocodingService = geocodingService;
        this.portService = portService;
    }

    public ContainerOfferDTO createOffer(ContainerOfferDTO dto, Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "User not found: " + providerId));
        ContainerOffer offer = new ContainerOffer();
        offer.setProvider(provider);
        offer.setContainerType(dto.getContainerType());
        offer.setCargoType(dto.getCargoType());
        offer.setSize(dto.getSize());
        offer.setTechnicalDetails(dto.getTechnicalDetails());
        offer.setLocation(dto.getLocation());
        
        // Auto-geocode using PortService if coordinates not provided
        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            portService.getPortDetails(dto.getLocation()).ifPresent(port -> {
                offer.setLatitude(port.getLatitude());
                offer.setLongitude(port.getLongitude());
            });
            // Fallback to GeocodingService if PortService returns empty
            if (offer.getLatitude() == null) {
                geocodingService.geocode(dto.getLocation()).ifPresent(result -> {
                    offer.setLatitude(result.getLatitude());
                    offer.setLongitude(result.getLongitude());
                });
            }
        } else {
            offer.setLatitude(dto.getLatitude());
            offer.setLongitude(dto.getLongitude());
        }
        
        offer.setAvailableDate(dto.getAvailableDate());
        offer.setStatus(ContainerOfferStatus.AVAILABLE);
        ContainerOffer saved = offerRepository.save(offer);
        return mapToDTO(saved);
    }

    public List<ContainerOfferDTO> getAvailableOffers() {
        return offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<ContainerOfferDTO> getOffersByProvider(Long providerId) {
        return offerRepository.findByProviderId(providerId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public ContainerOfferDTO getOfferById(Long offerId) {
        ContainerOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Offer not found: " + offerId));
        return mapToDTO(offer);
    }

    public ContainerOfferDTO updateOffer(Long id, 
                                      ContainerOfferDTO dto, 
                                      Long userId) {
        ContainerOffer offer = offerRepository.findById(id)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Offer not found: " + id));
        if (!offer.getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                "Not authorized");
        }
        if (dto.getLocation() != null)
            offer.setLocation(dto.getLocation());
        if (dto.getContainerType() != null)
            offer.setContainerType(dto.getContainerType());
        if (dto.getCargoType() != null)
            offer.setCargoType(dto.getCargoType());
        if (dto.getAvailableDate() != null)
            offer.setAvailableDate(dto.getAvailableDate());
        if (dto.getLatitude() != null)
            offer.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)
            offer.setLongitude(dto.getLongitude());
        return mapToDTO(offerRepository.save(offer));
    }

    public void updateOfferStatus(Long offerId,
                                   ContainerOfferStatus status,
                                   Long userId) {
        ContainerOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Offer not found: " + offerId));
        if (!offer.getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not the owner of offer " + offerId);
        }
        offer.setStatus(status);
        offerRepository.save(offer);
    }

    public void deleteOffer(Long offerId, Long userId) {
        ContainerOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Offer not found: " + offerId));
        if (!offer.getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                    "User " + userId + " is not the owner of offer " + offerId);
        }
        offerRepository.delete(offer);
    }

    private ContainerOfferDTO mapToDTO(ContainerOffer offer) {
        ContainerOfferDTO dto = new ContainerOfferDTO();
        dto.setId(offer.getId());
        dto.setProviderId(offer.getProvider().getId());
        dto.setProviderName(offer.getProvider().getFirstName()
                + " " + offer.getProvider().getLastName());
        dto.setContainerType(offer.getContainerType());
        dto.setCargoType(offer.getCargoType());
        dto.setSize(offer.getSize());
        dto.setTechnicalDetails(offer.getTechnicalDetails());
        dto.setLocation(offer.getLocation());
        dto.setLatitude(offer.getLatitude());
        dto.setLongitude(offer.getLongitude());
        dto.setAvailableDate(offer.getAvailableDate());
        dto.setStatus(offer.getStatus());
        dto.setCreatedAt(offer.getCreatedAt());
        return dto;
    }
}
