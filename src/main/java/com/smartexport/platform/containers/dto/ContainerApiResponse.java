package com.smartexport.platform.containers.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ContainerApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    public static <T> ContainerApiResponse<T> success(T data) {
        return new ContainerApiResponse<>(true, "Success", data);
    }

    public static <T> ContainerApiResponse<T> success(String message, T data) {
        return new ContainerApiResponse<>(true, message, data);
    }

    public static <T> ContainerApiResponse<T> error(String message) {
        return new ContainerApiResponse<>(false, message, null);
    }
}
