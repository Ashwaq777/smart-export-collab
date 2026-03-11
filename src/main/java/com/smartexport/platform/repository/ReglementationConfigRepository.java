package com.smartexport.platform.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.smartexport.platform.entity.ReglementationConfig;

@Repository
public interface ReglementationConfigRepository extends JpaRepository<ReglementationConfig, Long> {

    List<ReglementationConfig> findByActifOrderByZoneAscPaysAsc(Boolean actif);

    List<ReglementationConfig> findByZoneAndActifOrderByPaysAsc(String zone, Boolean actif);

    @Query("SELECT DISTINCT r.zone FROM ReglementationConfig r WHERE r.actif = true ORDER BY r.zone ASC")
    List<String> findDistinctZones();

    ReglementationConfig findByCodeAndActif(String code, Boolean actif);

    @Query("SELECT r FROM ReglementationConfig r WHERE r.actif = true AND " +
           "(LOWER(r.code) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(r.pays) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<ReglementationConfig> searchByTerm(String searchTerm);
}
