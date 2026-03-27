package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContainerTransactionRepository extends JpaRepository<ContainerTransaction, Long> {

    Optional<ContainerTransaction> findByMatch(ContainerMatch match);

    Optional<ContainerTransaction> findByMatchId(Long matchId);

    List<ContainerTransaction> findByMatchOfferProviderIdOrMatchRequestSeekerId(Long providerId, Long seekerId);
    
    @Query("SELECT t FROM ContainerTransaction t " +
           "JOIN t.match m " +
           "JOIN m.offer o " +
           "JOIN m.request r " +
           "WHERE o.provider.id = :userId OR r.seeker.id = :userId")
    List<ContainerTransaction> findMyTransactionsManual(@Param("userId") Long userId);
}
