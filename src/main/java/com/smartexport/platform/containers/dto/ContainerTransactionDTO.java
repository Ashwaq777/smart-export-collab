package com.smartexport.platform.containers.dto;

import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerTransactionDTO {
    private Long id;
    private Long matchId;
    private Long offerId;
    private Long requestId;
    private Boolean confirmedByProvider;
    private Boolean confirmedBySeeker;
    private String eirDocumentPath;
    private WorkflowStatus workflowStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Additional fields for frontend
    private String containerType;
    private String offerLocation;
    private String requestLocation;
}
