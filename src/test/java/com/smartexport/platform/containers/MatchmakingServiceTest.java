package com.smartexport.platform.containers;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerOfferRepository;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import com.smartexport.platform.containers.service.MatchmakingService;
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
    
    @InjectMocks
    MatchmakingService matchmakingService;

    private ContainerOffer createOffer(Long id, double lat, double lon,
                                       ContainerType type,
                                       LocalDate availableDate) {
        ContainerOffer o = new ContainerOffer();
        o.setId(id);
        o.setLatitude(lat);
        o.setLongitude(lon);
        o.setContainerType(type);
        o.setAvailableDate(availableDate);
        o.setStatus(ContainerOfferStatus.AVAILABLE);
        o.setLocation("Test Location");
        return o;
    }

    private ContainerRequest createRequest(double lat, double lon,
                                          ContainerType type,
                                          LocalDate requiredDate) {
        ContainerRequest r = new ContainerRequest();
        r.setId(1L);
        r.setLoadingLatitude(lat);
        r.setLoadingLongitude(lon);
        r.setContainerType(type);
        r.setRequiredDate(requiredDate);
        r.setLoadingLocation("Agadir");
        return r;
    }

    @Test
    void findMatches_perfectMatch_score100() {
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 14));

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 12));

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE))
                .thenReturn(Arrays.asList(offer));

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        ContainerMatch saved = captor.getValue();
        assertThat(saved.getCompatibilityScore()).isEqualTo(100.0);
    }

    @Test
    void findMatches_typeMismatch_score60() {
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 14));

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.STANDARD_20,
                LocalDate.of(2026, 6, 12));

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE))
                .thenReturn(Arrays.asList(offer));

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        assertThat(captor.getValue().getCompatibilityScore()).isEqualTo(60.0);
    }

    @Test
    void findMatches_incompatibleDates_score80() {
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 14));

        ContainerOffer offer = createOffer(1L,
                30.4300, -9.5900,
                ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 20));

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE))
                .thenReturn(Arrays.asList(offer));

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        assertThat(captor.getValue().getCompatibilityScore()).isEqualTo(80.0);
    }

    @Test
    void findMatches_onlyQueriesAvailableStatus() {
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 14));

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE))
                .thenReturn(Collections.emptyList());

        matchmakingService.findMatches(1L);

        verify(offerRepository).findByStatus(ContainerOfferStatus.AVAILABLE);
        verify(offerRepository, never()).findAll();
    }

    @Test
    void findMatches_TangerMed_to_Agadir_distance780km() {
        ContainerRequest request = createRequest(
                30.4210, -9.5831, ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 14));

        ContainerOffer offer = createOffer(1L,
                35.7595, -5.8340,
                ContainerType.HIGH_CUBE_40,
                LocalDate.of(2026, 6, 12));

        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));
        when(offerRepository.findByStatus(ContainerOfferStatus.AVAILABLE))
                .thenReturn(Arrays.asList(offer));

        ArgumentCaptor<ContainerMatch> captor =
                ArgumentCaptor.forClass(ContainerMatch.class);
        when(matchRepository.save(captor.capture())).thenAnswer(
                inv -> inv.getArgument(0));

        matchmakingService.findMatches(1L);

        // Tanger Med to Agadir should be ~689km
        assertThat(captor.getValue().getDistanceKm())
                .isBetween(680.0, 700.0);
    }
}
