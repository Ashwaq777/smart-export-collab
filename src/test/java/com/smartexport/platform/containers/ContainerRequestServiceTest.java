package com.smartexport.platform.containers;

import com.smartexport.platform.containers.dto.ContainerRequestDTO;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.repository.ContainerRequestRepository;
import com.smartexport.platform.containers.service.ContainerRequestService;
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
class ContainerRequestServiceTest {

    @Mock
    ContainerRequestRepository requestRepository;
    
    @Mock
    UserRepository userRepository;
    
    @Mock
    GeocodingService geocodingService;
    
    @Mock
    PortService portService;
    
    @InjectMocks
    ContainerRequestService requestService;

    private User createUser(Long id) {
        User u = new User();
        u.setId(id);
        u.setFirstName("John");
        u.setLastName("Doe");
        return u;
    }

    private ContainerRequest createRequest(Long id, User seeker) {
        ContainerRequest r = new ContainerRequest();
        r.setId(id);
        r.setSeeker(seeker);
        r.setContainerType(ContainerType.HIGH_CUBE_40);
        r.setLoadingLocation("Agadir");
        r.setRequiredDate(LocalDate.of(2026, 6, 14));
        r.setStatus(ContainerRequestStatus.SEARCHING);
        return r;
    }

    @Test
    void createRequest_success() {
        User seeker = createUser(1L);
        ContainerRequest saved = createRequest(1L, seeker);
        ContainerRequestDTO dto = new ContainerRequestDTO();
        dto.setContainerType(ContainerType.HIGH_CUBE_40);
        dto.setLoadingLocation("Agadir");
        dto.setLoadingLatitude(30.4); // Set coordinates to avoid geocoding
        dto.setLoadingLongitude(-9.6);
        dto.setRequiredDate(LocalDate.of(2026, 6, 14));

        when(userRepository.findById(1L)).thenReturn(Optional.of(seeker));
        when(requestRepository.save(any())).thenReturn(saved);

        ContainerRequestDTO result = requestService.createRequest(dto, 1L);

        assertThat(result).isNotNull();
        verify(requestRepository).save(any());
    }

    @Test
    void createRequest_userNotFound_throwsException() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        ContainerRequestDTO dto = new ContainerRequestDTO();
        assertThatThrownBy(() -> requestService.createRequest(dto, 99L))
                .isInstanceOf(ContainerNotFoundException.class);
    }

    @Test
    void getRequestsBySeeker_returnsCorrectList() {
        User seeker = createUser(1L);
        when(requestRepository.findBySeekerId(1L))
                .thenReturn(Arrays.asList(
                        createRequest(1L, seeker),
                        createRequest(2L, seeker)));

        List<ContainerRequestDTO> result = requestService.getRequestsBySeeker(1L);

        assertThat(result).hasSize(2);
    }

    @Test
    void updateRequestStatus_notOwner_throwsUnauthorized() {
        User seeker = createUser(1L);
        ContainerRequest request = createRequest(1L, seeker);
        when(requestRepository.findById(1L)).thenReturn(Optional.of(request));

        assertThatThrownBy(() ->
                requestService.updateRequestStatus(
                        1L, ContainerRequestStatus.CONFIRMED, 99L))
                .isInstanceOf(UnauthorizedContainerAccessException.class);
    }
}
