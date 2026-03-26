package com.smartexport.platform.containers.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cont_offer_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerOfferImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id", nullable = false)
    private ContainerOffer offer;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @Column(name = "image_order")
    private Integer imageOrder = 0;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = java.time.LocalDateTime.now();
    }
}
