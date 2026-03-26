package com.smartexport.platform.support.repository;

import com.smartexport.platform.support.entity.SupportTicket;
import com.smartexport.platform.support.entity.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository
    extends JpaRepository<SupportTicket, Long> {

    List<SupportTicket> 
        findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SupportTicket> 
        findByStatusOrderByCreatedAtDesc(
            TicketStatus status);

    List<SupportTicket>
        findAllByOrderByCreatedAtDesc();

    long countByStatus(TicketStatus status);
}
