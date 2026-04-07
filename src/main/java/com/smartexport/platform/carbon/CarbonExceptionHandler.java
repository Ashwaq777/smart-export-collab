package com.smartexport.platform.carbon;

import com.smartexport.platform.carbon.dto.CarbonResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class CarbonExceptionHandler {

    @ExceptionHandler(CarbonFactorNotFoundException.class)
    public ResponseEntity<CarbonResponseDTO> handleCarbonFactorNotFound(
            CarbonFactorNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
