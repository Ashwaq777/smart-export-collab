package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerMatchRepository extends JpaRepository<ContainerMatch, Long> {

    List<ContainerMatch> findByOfferId(Long offerId);

    List<ContainerMatch> findByRequestId(Long requestId);

    List<ContainerMatch> findByOfferProviderIdOrRequestSeekerId(Long providerId, Long seekerId);
}
