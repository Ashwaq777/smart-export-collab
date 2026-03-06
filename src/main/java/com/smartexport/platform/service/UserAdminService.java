package com.smartexport.platform.service;

import com.smartexport.platform.entity.Role;
import com.smartexport.platform.entity.User;
import com.smartexport.platform.entity.UserStatus;
import com.smartexport.platform.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class UserAdminService {

    private final UserRepository userRepository;

    public UserAdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> listUsers() {
        return userRepository.findAll();
    }

    public User updateRole(Long userId, Role newRole) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User updateStatus(Long userId, UserStatus newStatus) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(newStatus);
        return userRepository.save(user);
    }

    public User toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Toggle between ACTIVE and BLOCKED
        UserStatus newStatus = user.getStatus() == UserStatus.ACTIVE ? 
            UserStatus.BLOCKED : UserStatus.ACTIVE;
        user.setStatus(newStatus);
        
        return userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }
}
