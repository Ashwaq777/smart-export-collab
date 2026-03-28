package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerMatch;
import com.smartexport.platform.containers.entity.ContainerTransaction;
import com.smartexport.platform.containers.entity.enums.WorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
    
    List<ContainerTransaction> findByWorkflowStatus(WorkflowStatus workflowStatus);
    
    List<ContainerTransaction> findAllByOrderByCreatedAtDesc();
    
    boolean existsByMatchId(Long matchId);
    
    @Modifying
    @Query("DELETE FROM ContainerTransaction t WHERE t.match.id = :matchId")
    void deleteByMatchId(@Param("matchId") Long matchId);
    
    @Query("SELECT t FROM ContainerTransaction t " +
           "JOIN FETCH t.match m " +
           "JOIN FETCH m.offer o " +
           "JOIN FETCH m.request r " +
           "WHERE o.provider.id = :userId OR r.seeker.id = :userId")
    List<ContainerTransaction> findMyTransactionsManual(@Param("userId") Long userId);
}
