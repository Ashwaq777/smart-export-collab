package com.smartexport.platform.repository;

import com.smartexport.platform.entity.MaritimeRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaritimeRouteRepository extends JpaRepository<MaritimeRoute, Long> {
    
    @Query("SELECT mr FROM MaritimeRoute mr WHERE mr.originPort.id = :originPortId AND mr.destinationPort.id = :destPortId")
    Optional<MaritimeRoute> findByOriginAndDestination(@Param("originPortId") Long originPortId, @Param("destPortId") Long destPortId);
}
