package com.smartexport.platform.containers.controller;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import com.smartexport.platform.containers.dto.DashboardDTO;
import com.smartexport.platform.containers.dto.ContainerOfferDTO;
import com.smartexport.platform.containers.dto.ContainerRequestDTO;
import com.smartexport.platform.containers.dto.ContainerMatchDTO;
import com.smartexport.platform.containers.dto.ContainerTransactionDTO;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import com.smartexport.platform.containers.service.ContainerOfferService;
import com.smartexport.platform.containers.service.ContainerRequestService;
import com.smartexport.platform.containers.service.MatchmakingService;
import com.smartexport.platform.containers.service.ContainerTransactionService;
import com.smartexport.platform.containers.util.ContainerSecurityUtils;
import com.smartexport.platform.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/containers/dashboard")
@Tag(name = "Container Dashboard", description = "Centralized dashboard")
@RequiredArgsConstructor
public class ContainerDashboardController {

    private final ContainerOfferService offerService;
    private final ContainerRequestService requestService;
    private final MatchmakingService matchmakingService;
    private final ContainerTransactionService transactionService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get complete dashboard for current user")
    public ResponseEntity<ContainerApiResponse<DashboardDTO>>
            getDashboard() {
        Long userId = ContainerSecurityUtils.getCurrentUserId(userRepository);

        DashboardDTO dashboard = new DashboardDTO();

        // My offers
        List<ContainerOfferDTO> myOffers =
            offerService.getOffersByProvider(userId);
        dashboard.setMyOffers(myOffers);

        // My requests
        List<ContainerRequestDTO> myRequests =
            requestService.getRequestsBySeeker(userId);
        dashboard.setMyRequests(myRequests);

        // My matches
        List<ContainerMatchDTO> myMatches =
            matchmakingService.getMatchesByUserId(userId);
        dashboard.setMyMatches(myMatches);

        // My transactions
        List<ContainerTransactionDTO> myTransactions =
            transactionService.getMyTransactions(userId);
        dashboard.setMyTransactions(myTransactions);

        // Statistics
        dashboard.setTotalOffers(myOffers.size());
        dashboard.setAvailableOffers(myOffers.stream()
            .filter(o -> o.getStatus() == ContainerOfferStatus.AVAILABLE)
            .count());
        dashboard.setOffersInNegotiation(myOffers.stream()
            .filter(o -> o.getStatus() == ContainerOfferStatus.IN_NEGOTIATION)
            .count());
        dashboard.setTotalRequests(myRequests.size());
        dashboard.setActiveRequests(myRequests.stream()
            .filter(r -> r.getStatus() == ContainerRequestStatus.SEARCHING)
            .count());
        dashboard.setTotalMatches(myMatches.size());
        dashboard.setConfirmedMatches(myMatches.stream()
            .filter(m -> m.getStatus() == ContainerMatchStatus.CONFIRMED)
            .count());
        dashboard.setCompletedTransactions(myTransactions.stream()
            .filter(t -> t.getWorkflowStatus() == WorkflowStatus.COMPLETED)
            .count());

        return ResponseEntity.ok(ContainerApiResponse.success(dashboard));
    }
}
