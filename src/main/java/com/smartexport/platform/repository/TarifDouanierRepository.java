package com.smartexport.platform.repository;

import com.smartexport.platform.entity.TarifDouanier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarifDouanierRepository extends JpaRepository<TarifDouanier, Long> {
    
    Optional<TarifDouanier> findByCodeHsAndPaysDestination(String codeHs, String paysDestination);
    
    List<TarifDouanier> findByCategorie(String categorie);
    
    List<TarifDouanier> findByPaysDestination(String paysDestination);
}
