package com.smartexport.platform.repository;

import com.smartexport.platform.entity.SivPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SivPriceRepository extends JpaRepository<SivPrice, Long> {
    
    @Query("SELECT s FROM SivPrice s WHERE s.codeHs = :codeHs AND s.countryRegion = :region ORDER BY s.minEntryPrice ASC LIMIT 1")
    Optional<SivPrice> findByCodeHsAndRegion(@Param("codeHs") String codeHs, @Param("region") String region);
    
    Optional<SivPrice> findByCodeHs(String codeHs);
}
