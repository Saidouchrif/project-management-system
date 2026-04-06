package com.projectmanagement.backend.service;

import com.projectmanagement.backend.entity.*;
import com.projectmanagement.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CREATE USER (ADMIN ONLY)
    public Map<String, Object> create(User user, Role role) {

        Map<String, Object> response = new HashMap<>();

        try {
            User admin = getCurrentUser();

            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can create users");
            }

            if (user.getEmail() == null || user.getEmail().isBlank()) {
                throw new RuntimeException("Email is required");
            }
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                throw new RuntimeException("Password is required");
            }

            Optional<User> existing = userRepository.findByEmail(user.getEmail());

            if (existing.isPresent()) {
                if (existing.get().getDeletedAt() != null) {
                    response.put("message", "User exists but deleted, you can restore it");
                    return response;
                }
                throw new RuntimeException("User already exists");
            }

            user.setRole(role == null ? Role.EMPLOYE : role);
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setId(null);
            user.setDeletedAt(null);
            if (user.getCreatedAt() == null) {
                user.setCreatedAt(LocalDateTime.now());
            }
            userRepository.save(user);

            response.put("message", "User created successfully");
            response.put("data", buildSafeUserPayload(user));

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    // GET USERS
    public Map<String, Object> getAll() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> data = new ArrayList<>();
            for (User user : userRepository.findByDeletedAtIsNull()) {
                data.add(buildSafeUserPayload(user));
            }
            response.put("data", data);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    // DELETE
    public Map<String, Object> delete(Long id) {
        Map<String, Object> response = new HashMap<>();

        try {
            User admin = getCurrentUser();
            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can delete users");
            }

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
            User admin = getCurrentUser();
            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can restore users");
            }

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

    public Map<String, Object> updateRole(Long id, Role role) {
        Map<String, Object> response = new HashMap<>();

        try {
            User admin = getCurrentUser();
            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can update roles");
            }
            if (role == null) {
                throw new RuntimeException("Role is required");
            }

            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            user.setRole(role);
            userRepository.save(user);

            response.put("message", "User role updated");
            response.put("data", buildSafeUserPayload(user));

        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Unauthenticated user");
        }

        return userRepository.findByEmailAndDeletedAtIsNull(auth.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private Map<String, Object> buildSafeUserPayload(User user) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", user.getId());
        payload.put("name", user.getName());
        payload.put("email", user.getEmail());
        payload.put("role", user.getRole());
        payload.put("createdAt", user.getCreatedAt());
        return payload;
    }
}
