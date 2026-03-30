package com.smartexport.platform.containers.service;

import com.smartexport.platform.containers.dto.ContainerOfferDTO;
import com.smartexport.platform.containers.entity.ContainerOffer;
import jakarta.transaction.Transactional;
import com.smartexport.platform.containers.entity.ContainerOfferImage;
import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerOfferImageRepository;
import com.smartexport.platform.containers.repository.ContainerDirectRequestRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ContainerOfferService {

    private final ContainerOfferRepository offerRepository;
    private final ContainerMatchRepository matchRepository;
    private final ContainerOfferImageRepository imageRepository;
    private final ContainerDirectRequestRepository directRequestRepository;
    private final ContainerTransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final GeocodingService geocodingService;
    private final PortService portService;

    public ContainerOfferService(ContainerOfferRepository offerRepository,
                                  ContainerMatchRepository matchRepository,
                                  ContainerOfferImageRepository imageRepository,
                                  ContainerDirectRequestRepository directRequestRepository,
                                  ContainerTransactionRepository transactionRepository,
                                  UserRepository userRepository,
                                  GeocodingService geocodingService,
                                  @Qualifier("containerPortService") PortService portService) {
        this.offerRepository = offerRepository;
        this.matchRepository = matchRepository;
        this.imageRepository = imageRepository;
        this.directRequestRepository = directRequestRepository;
        this.transactionRepository = transactionRepository;
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
        offer.setDescription(dto.getDescription());
        offer.setTechnicalCondition(dto.getTechnicalCondition());
        offer.setYearOfManufacture(dto.getYearOfManufacture());
        offer.setContainerNumber(dto.getContainerNumber());
        
        // Auto-geocode using PortService if coordinates not provided
        if (dto.getLatitude() == null || dto.getLongitude() == null) {
            portService.getPortDetails(dto.getLocation()).ifPresent(port -> {
                offer.setLatitude(port.getLatitude());
                offer.setLongitude(port.getLongitude());
                offer.setPortName(port.getName());
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
            if (dto.getPortName() != null) {
                offer.setPortName(dto.getPortName());
            } else {
                // Try to get port name from location if not provided
                portService.getPortDetails(dto.getLocation()).ifPresent(port -> {
                    offer.setPortName(port.getName());
                });
            }
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

    @Transactional
    public void deleteOffer(Long offerId, Long userId) {
        Long providerIdFromDB = offerRepository.findProviderIdById(offerId);
        if (providerIdFromDB == null) throw new ContainerNotFoundException("Offer not found: " + offerId);
        if (providerIdFromDB.longValue() != userId.longValue()) {
            throw new UnauthorizedContainerAccessException("Not authorized");
        }
        
        // 1. Get all matches for this offer
        List<ContainerMatch> matches = matchRepository.findByOfferId(offerId);
        
        // 2. Delete transactions for each match
        for (ContainerMatch match : matches) {
            transactionRepository.deleteByMatchId(match.getId());
        }
        
        // 3. Delete direct requests
        if (directRequestRepository != null) {
            directRequestRepository.deleteByOfferId(offerId);
        }
        
        // 4. Delete images
        imageRepository.deleteByOfferId(offerId);
        
        // 5. Delete matches
        matchRepository.deleteAll(matches);
        
        // 6. Delete offer
        offerRepository.deleteById(offerId);
        
        log.info("Offer {} deleted successfully", offerId);
    }

    public List<String> uploadImages(Long offerId,
            List<MultipartFile> files, Long userId)
            throws java.io.IOException {
        ContainerOffer offer = offerRepository
            .findById(offerId)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Offer not found: " + offerId));
        if (!offer.getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                "Not authorized");
        }
        String uploadDir = "uploads/containers/images/";
        java.nio.file.Path uploadPath =
            java.nio.file.Paths.get(uploadDir);
        if (!java.nio.file.Files.exists(uploadPath)) {
            java.nio.file.Files.createDirectories(uploadPath);
        }
        List<String> urls = new java.util.ArrayList<>();
        int order = imageRepository
            .findByOfferIdOrderByImageOrder(offerId).size();
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            String ext = "";
            String orig = file.getOriginalFilename();
            if (orig != null && orig.contains(".")) {
                ext = orig.substring(orig.lastIndexOf("."));
            }
            String filename = java.util.UUID.randomUUID()
                .toString() + ext;
            java.nio.file.Path filePath =
                uploadPath.resolve(filename);
            java.nio.file.Files.copy(
                file.getInputStream(), filePath,
                java.nio.file.StandardCopyOption
                    .REPLACE_EXISTING);
            ContainerOfferImage image =
                new ContainerOfferImage();
            image.setOffer(offer);
            image.setImagePath(uploadDir + filename);
            image.setImageOrder(order++);
            imageRepository.save(image);
            urls.add("/api/v1/containers/offers/images/"
                + filename);
        }
        return urls;
    }

    public List<String> getImageUrls(Long offerId) {
        return imageRepository
            .findByOfferIdOrderByImageOrder(offerId)
            .stream()
            .map(img -> "/api/v1/containers/offers/images/"
                + java.nio.file.Paths.get(
                    img.getImagePath()).getFileName())
            .collect(java.util.stream.Collectors.toList());
    }

    public void deleteImages(Long offerId, Long userId) {
        ContainerOffer offer = offerRepository
            .findById(offerId)
            .orElseThrow(() -> new ContainerNotFoundException(
                "Offer not found: " + offerId));
        if (!offer.getProvider().getId().equals(userId)) {
            throw new UnauthorizedContainerAccessException(
                "Not authorized");
        }
        imageRepository
            .findByOfferIdOrderByImageOrder(offerId)
            .forEach(img -> {
                try {
                    java.nio.file.Files.deleteIfExists(
                        java.nio.file.Paths.get(
                            img.getImagePath()));
                } catch (Exception e) {
                    log.warn("Could not delete: {}",
                        e.getMessage());
                }
            });
        imageRepository.deleteByOfferId(offerId);
    }

    private ContainerOfferDTO mapToDTO(ContainerOffer offer) {
        ContainerOfferDTO dto = new ContainerOfferDTO();
        dto.setId(offer.getId());
        dto.setProviderId(offer.getProvider().getId());
        dto.setProviderName(offer.getProvider().getFirstName()
                + " " + offer.getProvider().getLastName());
        dto.setContainerType(offer.getContainerType());
        dto.setCargoType(dto.getCargoType());
        dto.setSize(offer.getSize());
        dto.setTechnicalDetails(offer.getTechnicalDetails());
        dto.setLocation(offer.getLocation());
        dto.setLatitude(offer.getLatitude());
        dto.setLongitude(offer.getLongitude());
        dto.setPortName(offer.getPortName());
        dto.setAvailableDate(offer.getAvailableDate());
        dto.setStatus(offer.getStatus());
        dto.setCreatedAt(offer.getCreatedAt());
        dto.setImageUrls(getImageUrls(offer.getId()));
        dto.setDescription(offer.getDescription());
        dto.setTechnicalCondition(
            offer.getTechnicalCondition());
        dto.setYearOfManufacture(
            offer.getYearOfManufacture());
        dto.setContainerNumber(offer.getContainerNumber());
        return dto;
    }
}
