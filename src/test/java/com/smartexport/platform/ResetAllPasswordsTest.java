package com.smartexport.platform;

import com.smartexport.platform.entity.User;
import com.smartexport.platform.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class ResetAllPasswordsTest {
    @Autowired 
    UserRepository userRepository;
    
    @Autowired 
    PasswordEncoder passwordEncoder;

    @Test
    void resetAllPasswords() {
        String newHash = passwordEncoder.encode("Test1234!");
        userRepository.findAll().forEach(user -> {
            user.setPasswordHash(newHash);
            user.setFailedAttempts(0);
            userRepository.save(user);
            System.out.println("Reset: " + user.getEmail() 
                + " role:" + user.getRole());
        });
    }
}
