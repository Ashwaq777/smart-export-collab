package com.smartexport.platform.containers;

import com.smartexport.platform.containers.dto.ContainerOfferDTO;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerOfferImageRepository;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.service.ContainerOfferService;
import com.smartexport.platform.containers.service.GeocodingService;
import com.smartexport.platform.containers.service.PortService;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContainerOfferServiceTest {

    @Mock
    ContainerOfferRepository offerRepository;
    
    @Mock
    ContainerMatchRepository matchRepository;
    
    @Mock
    ContainerOfferImageRepository imageRepository;
    
    @Mock
    UserRepository userRepository;
    
    @Mock
    GeocodingService geocodingService;
    
    @Mock
    PortService portService;
    
    @InjectMocks
    ContainerOfferService offerService;

    private User createUser(Long id) {
        User u = new User();
        u.setId(id);
        u.setFirstName("John");
        u.setLastName("Doe");
        return u;
    }

    private ContainerOffer createOffer(Long id, User provider) {
        ContainerOffer o = new ContainerOffer();
        o.setId(id);
        o.setProvider(provider);
        o.setContainerType(ContainerType.HIGH_CUBE_40);
        o.setCargoType(CargoType.DRY);
        o.setLocation("Tanger Med");
        o.setAvailableDate(LocalDate.of(2026, 6, 12));
        o.setStatus(ContainerOfferStatus.AVAILABLE);
        return o;
    }

    private ContainerOfferDTO createOfferDTO() {
        ContainerOfferDTO dto = new ContainerOfferDTO();
        dto.setContainerType(ContainerType.HIGH_CUBE_40);
        dto.setCargoType(CargoType.DRY);
        dto.setLocation("Tanger Med");
        dto.setLatitude(35.7595);
        dto.setLongitude(-5.8340);
        dto.setAvailableDate(LocalDate.of(2026, 6, 12));
        return dto;
    }

    @Test
    void createOffer_success() {
        User provider = createUser(1L);
        ContainerOffer savedOffer = createOffer(1L, provider);
        when(userRepository.findById(1L)).thenReturn(Optional.of(provider));
        when(offerRepository.save(any())).thenReturn(savedOffer);
        when(imageRepository.findByOfferIdOrderByImageOrder(any())).thenReturn(java.util.Collections.emptyList());

        ContainerOfferDTO result = offerService.createOffer(createOfferDTO(), 1L);

        assertThat(result).isNotNull();
        assertThat(result.getLocation()).isEqualTo("Tanger Med");
        verify(offerRepository).save(any());
    }

    @Test
    void createOffer_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> offerService.createOffer(createOfferDTO(), 99L))
                .isInstanceOf(ContainerNotFoundException.class);
    }

    @Test
    void getOffersByProvider_returnsCorrectList() {
        User provider = createUser(1L);
        List<ContainerOffer> offers = Arrays.asList(
                createOffer(1L, provider),
                createOffer(2L, provider)
        );
        when(offerRepository.findByProviderId(1L)).thenReturn(offers);
        when(imageRepository.findByOfferIdOrderByImageOrder(any())).thenReturn(java.util.Collections.emptyList());

        List<ContainerOfferDTO> result = offerService.getOffersByProvider(1L);

        assertThat(result).hasSize(2);
    }

    @Test
    void updateOfferStatus_notOwner_throwsUnauthorized() {
        User provider = createUser(1L);
        ContainerOffer offer = createOffer(1L, provider);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));

        assertThatThrownBy(() ->
                offerService.updateOfferStatus(1L, ContainerOfferStatus.RESERVED, 99L))
                .isInstanceOf(UnauthorizedContainerAccessException.class);
    }

    @Test
    void updateOfferStatus_owner_success() {
        User provider = createUser(1L);
        ContainerOffer offer = createOffer(1L, provider);
        when(offerRepository.findById(1L)).thenReturn(Optional.of(offer));
        when(offerRepository.save(any())).thenReturn(offer);

        offerService.updateOfferStatus(1L, ContainerOfferStatus.RESERVED, 1L);

        verify(offerRepository).save(any());
        assertThat(offer.getStatus()).isEqualTo(ContainerOfferStatus.RESERVED);
    }
}
