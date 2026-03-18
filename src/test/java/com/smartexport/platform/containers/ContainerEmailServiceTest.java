package com.smartexport.platform.containers;

import com.smartexport.platform.containers.entity.*;
import com.smartexport.platform.containers.entity.enums.*;
import com.smartexport.platform.containers.notification.ContainerEmailService;
import com.smartexport.platform.entity.User;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;
import org.thymeleaf.TemplateEngine;

import java.time.LocalDate;

import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContainerEmailServiceTest {

    @Mock 
    JavaMailSender mailSender;
    
    @Mock 
    TemplateEngine templateEngine;
    
    @InjectMocks 
    ContainerEmailService emailService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "mailEnabled", false);
        ReflectionTestUtils.setField(emailService, "fromAddress", "test@smartexportglobal.com");
    }

    private User createUser(Long id, String email) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setFirstName("Test");
        u.setLastName("User");
        return u;
    }

    private ContainerMatch buildMatch() {
        User provider = createUser(1L, "provider@test.com");
        User seeker = createUser(2L, "seeker@test.com");

        ContainerOffer offer = new ContainerOffer();
        offer.setId(1L);
        offer.setProvider(provider);
        offer.setLocation("Port of Rotterdam");
        offer.setContainerType(ContainerType.HIGH_CUBE_40);
        offer.setCargoType(CargoType.DRY);
        offer.setAvailableDate(LocalDate.of(2026, 6, 12));

        ContainerRequest request = new ContainerRequest();
        request.setId(1L);
        request.setSeeker(seeker);
        request.setLoadingLocation("Port of Shanghai");
        request.setRequiredDate(LocalDate.of(2026, 6, 20));

        ContainerMatch match = new ContainerMatch();
        match.setId(1L);
        match.setOffer(offer);
        match.setRequest(request);
        match.setDistanceKm(9270.0);
        match.setCompatibilityScore(80.0);
        return match;
    }

    @Test
    void sendMatchFoundEmail_mailDisabled_neverCallsMailSender() {
        emailService.sendMatchFoundEmail(buildMatch());
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendMatchConfirmedEmail_mailDisabled_neverCallsMailSender() {
        ContainerTransaction tx = new ContainerTransaction();
        tx.setId(1L);
        tx.setMatch(buildMatch());
        tx.setWorkflowStatus(WorkflowStatus.AT_PROVIDER);

        emailService.sendMatchConfirmedEmail(tx);
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendWorkflowUpdateEmail_mailDisabled_neverCallsMailSender() {
        ContainerTransaction tx = new ContainerTransaction();
        tx.setId(1L);
        tx.setMatch(buildMatch());
        tx.setWorkflowStatus(WorkflowStatus.IN_TRANSIT);

        emailService.sendWorkflowUpdateEmail(tx);
        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
