package com.smartexport.platform.containers.dto;

import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.entity.enums.ContainerOfferStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerOfferDTO {
    private Long id;
    private Long providerId;
    private String providerName;
    private ContainerType containerType;
    private CargoType cargoType;
    private String size;
    private String technicalDetails;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocalDate availableDate;
    private ContainerOfferStatus status;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
    private String description;
    private String technicalCondition;
    private Integer yearOfManufacture;
    private String containerNumber;
}
