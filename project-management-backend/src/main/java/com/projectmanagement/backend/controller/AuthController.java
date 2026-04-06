package com.projectmanagement.backend.controller;

import com.projectmanagement.backend.entity.Role;
import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.repository.UserRepository;
import com.projectmanagement.backend.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody User user) {

        Map<String, Object> res = new HashMap<>();

        try {
            Optional<User> existing = userRepository.findByEmail(user.getEmail());

            if (existing.isPresent()) {
                if (existing.get().getDeletedAt() != null) {
                    res.put("message", "User exists but deleted, you can restore it");
                    return res;
                }
                throw new RuntimeException("User already exists");
            }

            // default role
            if (user.getRole() == null) {
                user.setRole(Role.EMPLOYE);
            }

            user.setPassword(encoder.encode(user.getPassword()));

            userRepository.save(user);

            res.put("message", "User registered successfully");
            res.put("data", user);

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User user) {

        Map<String, Object> res = new HashMap<>();

        try {

            User dbUser = userRepository.findByEmailAndDeletedAtIsNull(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!encoder.matches(user.getPassword(), dbUser.getPassword())) {
                throw new RuntimeException("Invalid credentials");
            }

            String accessToken = jwtUtil.generateToken(dbUser.getEmail());
            String refreshToken = jwtUtil.generateRefreshToken(dbUser.getEmail());

            res.put("message", "Login successful");
            res.put("accessToken", accessToken);
            res.put("refreshToken", refreshToken);
            res.put("role", dbUser.getRole());

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    @PostMapping("/refresh")
    public Map<String, Object> refreshToken(@RequestParam String refreshToken) {

        Map<String, Object> res = new HashMap<>();

        try {

            if (!jwtUtil.validateToken(refreshToken)) {
                throw new RuntimeException("Invalid refresh token");
            }

            String email = jwtUtil.extractEmail(refreshToken);

            Optional<User> user = userRepository.findByEmailAndDeletedAtIsNull(email);

            if (user.isEmpty()) {
                throw new RuntimeException("User not found");
            }

            String newAccessToken = jwtUtil.generateToken(email);

            res.put("message", "Token refreshed");
            res.put("accessToken", newAccessToken);

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }

    // =========================
    // TEST PROTECTED ROUTE
    // =========================
    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(@RequestHeader("Authorization") String header) {

        Map<String, Object> res = new HashMap<>();

        try {

            String token = header.substring(7);
            String email = jwtUtil.extractEmail(token);

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            res.put("data", user);

        } catch (Exception e) {
            res.put("error", e.getMessage());
        }

        return res;
    }
}