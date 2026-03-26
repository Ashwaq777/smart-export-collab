package com.smartexport.platform.containers.repository;

import com.smartexport.platform.containers.entity.ContainerOfferImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContainerOfferImageRepository
        extends JpaRepository<ContainerOfferImage, Long> {

    List<ContainerOfferImage> findByOfferIdOrderByImageOrder(Long offerId);

    void deleteByOfferId(Long offerId);
}
