package com.smartexport.platform.repository;

import com.smartexport.platform.entity.Port;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PortRepository extends JpaRepository<Port, Long> {
    
    List<Port> findByPays(String pays);
    
    List<Port> findByTypePort(String typePort);
    
    List<Port> findByPaysAndTypePort(String pays, String typePort);
}
