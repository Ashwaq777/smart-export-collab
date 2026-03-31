package com.smartexport.platform.containers.util;

import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

public class ContainerSecurityUtils {

    public static Long getCurrentUserId(UserRepository userRepository) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        System.out.println("getCurrentUserId: principal=" + email);
        Long userId = userRepository.findByEmail(email)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Authenticated user not found: " + email))
                .getId();
        System.out.println("getCurrentUserId: found userId=" + userId + " for email=" + email);
        return userId;
    }
}
