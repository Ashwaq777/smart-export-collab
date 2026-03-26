package com.smartexport.platform.containers.dto;

import com.smartexport.platform.containers.entity.enums.DirectRequestStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DirectRequestDTO {
    private Long id;
    private Long offerId;
    private String offerLocation;
    private String containerType;
    private Long seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerCompany;
    private String message;
    private LocalDate requiredDate;
    private DirectRequestStatus status;
    private String providerResponse;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
