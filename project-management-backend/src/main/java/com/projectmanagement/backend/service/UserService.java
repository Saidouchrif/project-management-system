package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // CREATE USER (ADMIN ONLY)
    public Map<String, Object> create(User user, Role role, Long adminId) {

        Map<String, Object> response = new HashMap<>();

        try {
            User admin = userRepository.findById(adminId)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can create users");
            }

            Optional<User> existing = userRepository.findByEmail(user.getEmail());

            if (existing.isPresent()) {
                if (existing.get().getDeletedAt() != null) {
                    response.put("message", "User exists but deleted, you can restore it");
                    return response;
                }
                throw new RuntimeException("User already exists");
            }

            user.setRole(role);
            userRepository.save(user);

            response.put("message", "User created successfully");
            response.put("data", user);

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    // GET USERS
    public Map<String, Object> getAll() {
        Map<String, Object> response = new HashMap<>();

        try {
            response.put("data", userRepository.findByDeletedAtIsNull());
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    // DELETE
    public Map<String, Object> delete(Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setDeletedAt(LocalDateTime.now());
            userRepository.save(user);

            response.put("message", "User deleted");

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    // RESTORE
    public Map<String, Object> restore(Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setDeletedAt(null);
            userRepository.save(user);

            response.put("message", "User restored");

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }
}