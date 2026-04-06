package com.projectmanagement.backend.config;

import com.projectmanagement.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // PUBLIC
                .requestMatchers("/api/auth/**").permitAll()

                // ADMIN
                .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                // MANAGER + ADMIN
                .requestMatchers("/api/projects/**")
                .hasAnyAuthority("ADMIN", "MANAGER")

                // TASK
                .requestMatchers("/api/tasks/**")
                .hasAnyAuthority("MANAGER", "EMPLOYE")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}