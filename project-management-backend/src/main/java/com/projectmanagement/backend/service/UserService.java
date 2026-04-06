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

    public Map<String, Object> getDeleted() {
        Map<String, Object> response = new HashMap<>();

        try {
            User admin = getCurrentUser();
            if (admin.getRole() != Role.ADMIN) {
                throw new RuntimeException("Only ADMIN can view deleted users");
            }

            List<Map<String, Object>> data = new ArrayList<>();
            for (User user : userRepository.findByDeletedAtIsNotNull()) {
                data.add(buildSafeUserPayload(user));
            }
            response.put("data", data);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> getUserOptions() {
        Map<String, Object> response = new HashMap<>();

        try {
            User actor = getCurrentUser();
            List<Map<String, Object>> data = new ArrayList<>();

            if (actor.getRole() == Role.EMPLOYE) {
                data.add(buildSafeUserPayload(actor));
            } else {
                for (User user : userRepository.findByDeletedAtIsNull()) {
                    data.add(buildSafeUserPayload(user));
                }
            }

            response.put("data", data);
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

    public Map<String, Object> getMyProfile() {
        Map<String, Object> response = new HashMap<>();

        try {
            User currentUser = getCurrentUser();
            response.put("data", buildSafeUserPayload(currentUser));
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> updateMyProfile(String name, String email) {
        Map<String, Object> response = new HashMap<>();

        try {
            User currentUser = getCurrentUser();

            boolean hasName = name != null && !name.isBlank();
            boolean hasEmail = email != null && !email.isBlank();

            if (!hasName && !hasEmail) {
                throw new RuntimeException("Name or email is required");
            }

            if (hasEmail) {
                String newEmail = email.trim().toLowerCase(Locale.ROOT);
                Optional<User> existing = userRepository.findByEmail(newEmail);
                if (existing.isPresent() && !Objects.equals(existing.get().getId(), currentUser.getId())) {
                    throw new RuntimeException("Email already exists");
                }
                currentUser.setEmail(newEmail);
            }

            if (hasName) {
                currentUser.setName(name.trim());
            }

            userRepository.save(currentUser);

            response.put("message", "Profile updated successfully");
            response.put("data", buildSafeUserPayload(currentUser));
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    public Map<String, Object> changeMyPassword(String oldPassword, String newPassword) {
        Map<String, Object> response = new HashMap<>();

        try {
            User currentUser = getCurrentUser();

            if (oldPassword == null || oldPassword.isBlank()) {
                throw new RuntimeException("Old password is required");
            }
            if (newPassword == null || newPassword.isBlank()) {
                throw new RuntimeException("New password is required");
            }
            if (newPassword.length() < 6) {
                throw new RuntimeException("New password must contain at least 6 characters");
            }
            if (!passwordEncoder.matches(oldPassword, currentUser.getPassword())) {
                throw new RuntimeException("Old password is incorrect");
            }
            if (passwordEncoder.matches(newPassword, currentUser.getPassword())) {
                throw new RuntimeException("New password must be different from old password");
            }

            currentUser.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(currentUser);

            response.put("message", "Password changed successfully");
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
