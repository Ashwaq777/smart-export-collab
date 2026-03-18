package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerOffer;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerOfferRepository extends JpaRepository<ContainerOffer, Long> {

    List<ContainerOffer> findByStatus(ContainerOfferStatus status);

    List<ContainerOffer> findByProviderId(Long providerId);

    List<ContainerOffer> findByProviderIdAndStatus(Long providerId, ContainerOfferStatus status);
}
