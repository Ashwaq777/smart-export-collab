package com.smartexport.platform.containers.entity;

import com.smartexport.platform.containers.entity.enums.DirectRequestStatus;
import com.smartexport.platform.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cont_direct_request")
@Getter @Setter @NoArgsConstructor
public class ContainerDirectRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private ContainerOffer offer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    private com.smartexport.platform.entity.User seeker;

    @Column(nullable = false, 
            columnDefinition = "TEXT")
    private String message;

    @Column(name = "seeker_company")
    private String seekerCompany;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DirectRequestStatus status = 
        DirectRequestStatus.PENDING;

    @Column(name = "provider_response",
            columnDefinition = "TEXT")
    private String providerResponse;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
