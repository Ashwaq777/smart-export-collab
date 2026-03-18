package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerRequest;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContainerRequestRepository extends JpaRepository<ContainerRequest, Long> {

    List<ContainerRequest> findBySeekerId(Long seekerId);

    List<ContainerRequest> findBySeekerIdAndStatus(Long seekerId, ContainerRequestStatus status);
}
