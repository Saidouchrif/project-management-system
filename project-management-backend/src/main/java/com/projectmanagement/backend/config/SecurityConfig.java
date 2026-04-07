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
import jakarta.servlet.http.HttpServletResponse;

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
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)
            .exceptionHandling(exception -> exception
                    .authenticationEntryPoint((request, response, ex) ->
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized"))
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // PUBLIC
                .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()
                .requestMatchers("/api/auth/me").authenticated()

                // USER SELF-PROFILE
                .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/users/me/password").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/options")
                .hasAnyAuthority("ADMIN", "MANAGER", "EMPLOYE")

                // ADMIN
                .requestMatchers("/api/users/**").hasAuthority("ADMIN")

                // PROJECTS
                .requestMatchers(HttpMethod.POST, "/api/projects/**").hasAuthority("MANAGER")
                .requestMatchers(HttpMethod.GET, "/api/projects/**")
                .hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/projects/**")
                .hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/projects/restore/**")
                .hasAnyAuthority("ADMIN", "MANAGER")

                // TASKS
                .requestMatchers(HttpMethod.POST, "/api/tasks/**").hasAuthority("MANAGER")
                .requestMatchers(HttpMethod.PATCH, "/api/tasks/*/status").hasAuthority("EMPLOYE")
                .requestMatchers(HttpMethod.GET, "/api/tasks/**")
                .hasAnyAuthority("ADMIN", "MANAGER", "EMPLOYE")
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**")
                .hasAnyAuthority("ADMIN", "MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/tasks/restore/**")
                .hasAnyAuthority("ADMIN", "MANAGER")

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
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toList();
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
