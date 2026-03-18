package com.smartexport.platform.containers.entity;

import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "cont_transaction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "match_id", nullable = false)
    private ContainerMatch match;

    @Column(name = "confirmed_by_provider", nullable = false)
    private Boolean confirmedByProvider = false;

    @Column(name = "confirmed_by_seeker", nullable = false)
    private Boolean confirmedBySeeker = false;

    @Column(name = "eir_document_path")
    private String eirDocumentPath;

    @Enumerated(EnumType.STRING)
    @Column(name = "workflow_status", nullable = false)
    private WorkflowStatus workflowStatus = WorkflowStatus.AT_PROVIDER;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
