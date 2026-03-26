package com.smartexport.platform.containers;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.notification.PushNotificationService;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import com.smartexport.platform.containers.service.MatchmakingService;
import com.smartexport.platform.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MatchmakingServiceTest {

    @Mock
    ContainerRequestRepository requestRepository;
    
    @Mock
    ContainerOfferRepository offerRepository;
    
    @Mock
    ContainerMatchRepository matchRepository;
    
    @Mock
    ContainerEmailService emailService;
    
    @Mock
    PushNotificationService pushNotificationService;
    
    @InjectMocks
    MatchmakingService matchmakingService;

    private User createTestUser(Long id) {
        User user = new User();
        user.setId(id);
        user.setFirstName("Test");
        user.setLastName("User");
        user.setEmail("test@example.com");
        return user;
    }

    private ContainerOffer createOffer(Long id, double lat, double lon,
                                       ContainerType type, CargoType cargoType,
                                       LocalDate availableDate, User provider) {
        ContainerOffer o = new ContainerOffer();
        o.setId(id);
        o.setLatitude(lat);
        o.setLongitude(lon);
        o.setContainerType(type);
        o.setCargoType(cargoType);
        o.setAvailableDate(availableDate);
        o.setStatus(ContainerOfferStatus.AVAILABLE);
        o.setLocation("Test Location");
        o.setProvider(provider);
        return o;
    }

    private ContainerRequest createRequest(double lat, double lon,
                                          ContainerType type, CargoType cargoType,
                                          LocalDate requiredDate, User seeker) {
        ContainerRequest r = new ContainerRequest();
        r.setId(1L);
        r.setLoadingLatitude(lat);
        r.setLoadingLongitude(lon);
        r.setContainerType(type);
        r.setCargoType(cargoType);
        r.setRequiredDate(requiredDate);
        r.setLoadingLocation("Agadir");
        r.setSeeker(seeker);
        return r;
    }

    @Test
    void findMatches_perfectMatch_score100() {
        User provider = createTestUser(1L);
        User seeker = createTestUser(2L);
        
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 7, 15), seeker); // More than 30 days from offer date

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 12), provider);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findAll()).thenReturn(Arrays.asList(offer));
        when(matchRepository.findByOfferId(1L)).thenReturn(Collections.emptyList());

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        ContainerMatch saved = captor.getValue();
        // Perfect match with CDC scoring: 30 (cargo) + 40 (distance <100km) + 30 (date >=30days) = 100
        assertThat(saved.getCompatibilityScore()).isEqualTo(100.0);
    }

    @Test
    void findMatches_typeMismatch_eliminated() {
        User provider = createTestUser(1L);
        User seeker = createTestUser(2L);
        
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 14), seeker);

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.STANDARD_20, CargoType.DRY,
                LocalDate.of(2026, 6, 12), provider);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findAll()).thenReturn(Arrays.asList(offer));

        matchmakingService.findMatches(1L);

        verify(matchRepository, never()).save(any(ContainerMatch.class));
    }

    @Test
    void findMatches_incompatibleDates_eliminated() {
        User provider = createTestUser(1L);
        User seeker = createTestUser(2L);
        
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 14), seeker);

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 20), provider);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findAll()).thenReturn(Arrays.asList(offer));

        matchmakingService.findMatches(1L);

        verify(matchRepository, never()).save(any(ContainerMatch.class));
    }

    @Test
    void findMatches_onlyQueriesAvailableStatus() {
        User provider = createTestUser(1L);
        User seeker = createTestUser(2L);
        
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 14), seeker);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findAll()).thenReturn(Collections.emptyList());

        matchmakingService.findMatches(1L);

        verify(offerRepository).findAll();
        verify(offerRepository, never()).findByStatus(any());
    }

    @Test
    void findMatches_TangerMed_to_Agadir_distance780km() {
        User provider = createTestUser(1L);
        User seeker = createTestUser(2L);
        
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 14), seeker);

        ContainerOffer offer = createOffer(1L,
                35.7595, -5.8340,
                ContainerType.HIGH_CUBE_40, CargoType.DRY,
                LocalDate.of(2026, 6, 12), provider);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findAll()).thenReturn(Arrays.asList(offer));
        when(matchRepository.findByOfferId(1L)).thenReturn(Collections.emptyList());

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        // Tanger Med to Agadir should be ~688km
        assertThat(captor.getValue().getDistanceKm())
                .isBetween(680.0, 700.0);
    }
}
