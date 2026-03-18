package com.smartexport.platform.containers.dto;

import com.smartexport.platform.containers.entity.enums.ContainerType;
import com.smartexport.platform.containers.entity.enums.CargoType;
import com.smartexport.platform.containers.entity.enums.ContainerRequestStatus;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerRequestDTO {
    private Long id;
    private Long seekerId;
    private String seekerName;
    private ContainerType containerType;
    private CargoType cargoType;
    private String size;
    private String loadingLocation;
    private Double loadingLatitude;
    private Double loadingLongitude;
    private LocalDate requiredDate;
    private ContainerRequestStatus status;
    private LocalDateTime createdAt;
}
