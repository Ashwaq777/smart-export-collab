package com.smartexport.platform.containers.util;

import com.smartexport.platform.containers.exception.ContainerNotFoundException;
import com.smartexport.platform.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;

public class ContainerSecurityUtils {

    public static Long getCurrentUserId(UserRepository userRepository) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ContainerNotFoundException(
                        "Authenticated user not found: " + email))
                .getId();
    }
}
