package com.smartexport.platform.carbon;

import com.smartexport.platform.carbon.CarbonFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CarbonFactorRepository extends JpaRepository<CarbonFactor, Long> {
    @Query("SELECT c FROM CarbonFactor c WHERE " +
           "c.transportMode = :mode AND (c.vehicleSubtype IS NULL OR c.vehicleSubtype = '')")
    Optional<CarbonFactor> findByTransportMode(@Param("mode") String mode);
    
    @Query("SELECT c FROM CarbonFactor c WHERE " +
           "c.transportMode = :mode AND c.vehicleSubtype = :subtype")
    Optional<CarbonFactor> findByTransportModeAndVehicleSubtype(
      @Param("mode") String mode, 
      @Param("subtype") String subtype
    );
}
