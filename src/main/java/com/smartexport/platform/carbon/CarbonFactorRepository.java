package com.smartexport.platform.carbon;

import com.smartexport.platform.carbon.CarbonFactor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CarbonFactorRepository extends JpaRepository<CarbonFactor, Long> {
    Optional<CarbonFactor> findByTransportMode(String transportMode);
}
