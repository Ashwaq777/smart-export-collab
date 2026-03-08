package com.smartexport.platform.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.smartexport.platform.entity.TraceabilityRecord;

@Repository
public interface TraceabilityRecordRepository extends JpaRepository<TraceabilityRecord, Long>, JpaSpecificationExecutor<TraceabilityRecord> {

    // Legacy method for compatibility
    @Query("SELECT t FROM TraceabilityRecord t WHERE " +
           "(:producteur IS NULL OR :producteur = '' OR t.producteur LIKE %:producteur%) AND " +
           "(:paysOrigine IS NULL OR :paysOrigine = '' OR t.paysOrigine LIKE %:paysOrigine%) AND " +
           "(:dateDebut IS NULL OR t.dateRecolte >= :dateDebut) AND " +
           "(:dateFin IS NULL OR t.dateRecolte <= :dateFin) AND " +
           "t.statut = 'VALIDÉ'")
    Page<TraceabilityRecord> findWithFilters(
        @Param("producteur") String producteur,
        @Param("paysOrigine") String paysOrigine,
        @Param("dateDebut") String dateDebut,
        @Param("dateFin") String dateFin,
        Pageable pageable);

    // New methods for TraceabilityService
    long countByStatut(String statut);
    long countByCreatedAtAfter(LocalDateTime dateTime);
    long count();
}