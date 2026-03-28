package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerDirectRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerDirectRequestRepository
    extends JpaRepository<ContainerDirectRequest, Long> {

    List<ContainerDirectRequest>
        findBySeekerIdOrderByCreatedAtDesc(
            Long seekerId);

    List<ContainerDirectRequest>
        findByOffer_Provider_IdOrderByCreatedAtDesc(
            Long providerId);

    boolean existsByOfferIdAndSeekerId(
        Long offerId, Long seekerId);
    
    @Modifying
    @Query("DELETE FROM ContainerDirectRequest d WHERE d.offer.id = :offerId")
    void deleteByOfferId(@Param("offerId") Long offerId);
}
