package com.smartexport.platform.containers.exception;

import com.smartexport.platform.containers.dto.ContainerApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class ContainerExceptionHandler {

    @ExceptionHandler(ContainerNotFoundException.class)
    public ResponseEntity<ContainerApiResponse<Void>> handleNotFound(
            ContainerNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ContainerApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(UnauthorizedContainerAccessException.class)
    public ResponseEntity<ContainerApiResponse<Void>> handleUnauthorized(
            UnauthorizedContainerAccessException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ContainerApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ContainerApiResponse<Void>> handleBadRequest(
            IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ContainerApiResponse.error(ex.getMessage()));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ContainerApiResponse<Void>> handleFileTooLarge(
            MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(ContainerApiResponse.error("File size exceeds limit"));
    }
}
