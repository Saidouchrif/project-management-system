package com.projectmanagement.backend.config;

import com.projectmanagement.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                // PUBLIC
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/refresh").permitAll()

                // USER SELF-PROFILE
                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me/password").authenticated()

                // ADMIN
                .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                // PROJECTS
                .requestMatchers(HttpMethod.POST, "/api/projects/**").hasAuthority("MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/projects/**")
                .hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/projects/**").hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/projects/restore/**").hasAnyAuthority("ADMIN", "MANAGER")

                // TASKS
                .requestMatchers(HttpMethod.POST, "/api/tasks/**").hasAuthority("MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status").hasAuthority("EMPLOYE")
                .requestMatchers(HttpMethod.GET, "/api/tasks/**").hasAnyAuthority("ADMIN", "MANAGER", "EMPLOYE")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/tasks/restore/**").hasAnyAuthority("ADMIN", "MANAGER")

                // AUTH PROTECTED
                .requestMatchers("/api/auth/me").authenticated()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
