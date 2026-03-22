package com.smartexport.platform;

import com.smartexport.platform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ResetPasswordsTest {
    @Autowired
    UserRepository userRepository;
    
    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    void resetAll() {
        String hash = passwordEncoder.encode("Test1234!");
        userRepository.findAll().forEach(u -> {
            u.setPasswordHash(hash);
            u.setFailedAttempts(0);
            userRepository.save(u);
            System.out.println("Reset: " + u.getEmail());
        });
    }
}
