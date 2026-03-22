package com.smartexport.platform.containers;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.containers.exception.UnauthorizedContainerAccessException;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.notification.PushNotificationService;
import com.smartexport.platform.containers.repository.ContainerMatchRepository;
import com.smartexport.platform.containers.repository.ContainerTransactionRepository;
import com.smartexport.platform.containers.service.ContainerTransactionService;
import com.smartexport.platform.containers.service.EirPdfService;
import com.smartexport.platform.entity.User;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContainerTransactionServiceTest {

    @Mock
    ContainerTransactionRepository transactionRepository;
    
    @Mock
    ContainerMatchRepository matchRepository;
    
    @Mock
    ContainerEmailService emailService;
    
    @Mock
    PushNotificationService pushNotificationService;
    
    @Mock
    EirPdfService eirPdfService;
    
    @InjectMocks
    ContainerTransactionService transactionService;

    private User createUser(Long id) {
        User u = new User();
        u.setId(id);
        return u;
    }

    private ContainerOffer createOffer(User provider) {
        ContainerOffer o = new ContainerOffer();
        o.setId(1L);
        o.setProvider(provider);
        o.setLocation("Tanger Med");
        return o;
    }

    private ContainerRequest createReq(User seeker) {
        ContainerRequest r = new ContainerRequest();
        r.setId(1L);
        r.setSeeker(seeker);
        r.setLoadingLocation("Agadir");
        return r;
    }

    private ContainerMatch createMatch(User provider, User seeker) {
        ContainerMatch m = new ContainerMatch();
        m.setId(1L);
        m.setOffer(createOffer(provider));
        m.setRequest(createReq(seeker));
        m.setStatus(ContainerMatchStatus.PENDING);
        return m;
    }

    private ContainerTransaction createTx(ContainerMatch match) {
        ContainerTransaction tx = new ContainerTransaction();
        tx.setId(1L);
        tx.setMatch(match);
        tx.setConfirmedByProvider(false);
        tx.setConfirmedBySeeker(false);
        tx.setWorkflowStatus(WorkflowStatus.AT_PROVIDER);
        return tx;
    }

    @Test
    void confirmByProvider_success() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);
        ContainerTransaction tx = createTx(match);

        when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(transactionRepository.findByMatch(match)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any())).thenReturn(tx);

        transactionService.confirmByProvider(1L, 1L);

        assertThat(tx.getConfirmedByProvider()).isTrue();
        verify(transactionRepository).save(tx);
    }

    @Test
    void confirmByProvider_wrongUser_throwsUnauthorized() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);

        when(matchRepository.findById(1L)).thenReturn(Optional.of(match));

        assertThatThrownBy(() -> transactionService.confirmByProvider(1L, 99L))
                .isInstanceOf(UnauthorizedContainerAccessException.class);
    }

    @Test
    void confirmBySeeker_success() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);
        ContainerTransaction tx = createTx(match);

        when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(transactionRepository.findByMatch(match)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any())).thenReturn(tx);

        transactionService.confirmBySeeker(1L, 2L);

        assertThat(tx.getConfirmedBySeeker()).isTrue();
        verify(transactionRepository).save(tx);
    }

    @Test
    void bothConfirm_setsMatchConfirmed() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);
        ContainerTransaction tx = createTx(match);
        tx.setConfirmedByProvider(true);

        when(matchRepository.findById(1L)).thenReturn(Optional.of(match));
        when(transactionRepository.findByMatch(match)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any())).thenReturn(tx);
        when(matchRepository.save(any())).thenReturn(match);

        transactionService.confirmBySeeker(1L, 2L);

        assertThat(match.getStatus()).isEqualTo(ContainerMatchStatus.CONFIRMED);
        verify(matchRepository).save(match);
    }

    @Test
    void updateWorkflowStatus_success() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);
        ContainerTransaction tx = createTx(match);

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(tx));
        when(transactionRepository.save(any())).thenReturn(tx);

        transactionService.updateWorkflowStatus(1L, WorkflowStatus.IN_TRANSIT, 1L);

        assertThat(tx.getWorkflowStatus()).isEqualTo(WorkflowStatus.IN_TRANSIT);
        verify(transactionRepository).save(tx);
    }

    @Test
    void updateWorkflowStatus_unauthorizedUser_throwsException() {
        User provider = createUser(1L);
        User seeker = createUser(2L);
        ContainerMatch match = createMatch(provider, seeker);
        ContainerTransaction tx = createTx(match);

        when(transactionRepository.findById(1L)).thenReturn(Optional.of(tx));

        assertThatThrownBy(() ->
                transactionService.updateWorkflowStatus(1L, WorkflowStatus.IN_TRANSIT, 99L))
                .isInstanceOf(UnauthorizedContainerAccessException.class);
    }
}
