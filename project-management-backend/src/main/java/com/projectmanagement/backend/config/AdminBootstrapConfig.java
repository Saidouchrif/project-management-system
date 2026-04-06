package com.projectmanagement.backend.config;

import com.projectmanagement.backend.entity.Role;
import com.projectmanagement.backend.entity.User;
import com.projectmanagement.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminBootstrapConfig {

    @Bean
    public CommandLineRunner bootstrapAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin.email:admin@pms.local}") String adminEmail,
            @Value("${app.bootstrap.admin.password:admin123}") String adminPassword,
            @Value("${app.bootstrap.admin.name:System Admin}") String adminName) {

        return args -> {
            if (!userRepository.findByRoleAndDeletedAtIsNull(Role.ADMIN).isEmpty()) {
                return;
            }

            User adminUser = userRepository.findByEmail(adminEmail).orElseGet(User::new);

            if (adminUser.getId() != null && adminUser.getRole() != null && adminUser.getRole() != Role.ADMIN) {
                return;
            }

            adminUser.setName(adminName);
            adminUser.setEmail(adminEmail);
            adminUser.setPassword(passwordEncoder.encode(adminPassword));
            adminUser.setRole(Role.ADMIN);
            adminUser.setDeletedAt(null);
            userRepository.save(adminUser);
        };
    }
}
