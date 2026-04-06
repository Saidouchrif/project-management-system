package com.projectmanagement.backend.config;

import com.projectmanagement.backend.security.JwtAuthFilter;
import org.springframework.context.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            .cors(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

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

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
