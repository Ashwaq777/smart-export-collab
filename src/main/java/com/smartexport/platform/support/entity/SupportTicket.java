package com.smartexport.platform.support.entity;

import com.smartexport.platform.support.entity.enums.TicketCategory;
import com.smartexport.platform.support.entity.enums.TicketPriority;
import com.smartexport.platform.support.entity.enums.TicketStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_ticket")
@Getter @Setter @NoArgsConstructor
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private com.smartexport.platform.entity.User user;

    @Column(nullable = false)
    private String subject;

    @Column(nullable = false, 
            columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketPriority priority = 
        TicketPriority.MEDIUM;

    @Column(name = "admin_response",
            columnDefinition = "TEXT")
    private String adminResponse;

    @Column(name = "related_offer_id")
    private Long relatedOfferId;

    @Column(name = "related_transaction_id")
    private Long relatedTransactionId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
