package com.smartexport.platform.support.dto;

import com.smartexport.platform.support.entity.enums.TicketCategory;
import com.smartexport.platform.support.entity.enums.TicketPriority;
import com.smartexport.platform.support.entity.enums.TicketStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SupportTicketDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userRole;
    private String userPhone;
    private String userCompany;
    private String userCountry;
    private String subject;
    private String description;
    private TicketCategory category;
    private TicketStatus status;
    private TicketPriority priority;
    private String adminResponse;
    private Long relatedOfferId;
    private Long relatedTransactionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
