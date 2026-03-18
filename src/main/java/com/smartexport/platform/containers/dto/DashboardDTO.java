package com.smartexport.platform.containers.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private List<ContainerOfferDTO> myOffers;
    private List<ContainerRequestDTO> myRequests;
    private List<ContainerMatchDTO> myMatches;
    private List<ContainerTransactionDTO> myTransactions;
    private long totalOffers;
    private long availableOffers;
    private long offersInNegotiation;
    private long totalRequests;
    private long activeRequests;
    private long totalMatches;
    private long confirmedMatches;
    private long completedTransactions;
}
