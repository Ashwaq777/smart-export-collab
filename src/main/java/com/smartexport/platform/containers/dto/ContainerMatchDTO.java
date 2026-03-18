package com.smartexport.platform.containers.dto;

import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.ContainerMatchStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerMatchDTO {
    private Long id;
    private Long offerId;
    private Long requestId;
    private Long offerProviderId;
    private Long requestSeekerId;
    private String offerLocation;
    private String requestLocation;
    private ContainerType containerType;
    private Double distanceKm;
    private Double compatibilityScore;
    private ContainerMatchStatus status;
    private LocalDateTime createdAt;
}
