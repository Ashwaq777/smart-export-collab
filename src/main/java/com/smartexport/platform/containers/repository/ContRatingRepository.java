package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContRatingRepository extends JpaRepository<ContRating, Long> {
    List<ContRating> findByRatedId(Long ratedId);
    boolean existsByTransactionIdAndRaterId(Long transactionId, Long raterId);
    List<ContRating> findByTransactionId(Long transactionId);
}
