package com.smartexport.platform.containers.exception;

public class ContainerNotFoundException extends RuntimeException {
    public ContainerNotFoundException(String message) {
        super(message);
    }
}
