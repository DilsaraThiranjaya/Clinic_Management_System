package com.mycompany.clinic_management_system.config;

import com.mycompany.clinic_management_system.security.JwtAuthenticationEntryPoint;
import com.mycompany.clinic_management_system.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Security configuration implementing JWT-based Role-Based Access Control (RBAC).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .authorizeHttpRequests(auth -> auth
                        // Public static resources & web client
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/favicon.ico",
                                "/assets/**"
                        ).permitAll()

                        // Public authentication & system endpoints (Login ONLY)
                        .requestMatchers("/api/auth/login", "/api/users/login", "/h2-console/**", "/error").permitAll()

                        // User & Doctor Directory endpoints
                        .requestMatchers(HttpMethod.GET, "/api/users/doctors").hasAnyRole("ADMIN", "STAFF", "DOCTOR", "PATIENT")
                        .requestMatchers(HttpMethod.POST, "/api/users/register").hasAnyRole("ADMIN", "STAFF")
                        .requestMatchers("/api/auth/register", "/api/users/**").hasRole("ADMIN")

                        // Patient endpoints
                        .requestMatchers(HttpMethod.GET, "/api/patients/{id}").hasAnyRole("ADMIN", "STAFF", "PATIENT", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/patients").hasAnyRole("ADMIN", "STAFF", "DOCTOR")
                        .requestMatchers("/api/patients/**").hasAnyRole("ADMIN", "STAFF")

                        // Appointment endpoints
                        .requestMatchers(HttpMethod.GET, "/api/appointments/my").hasRole("PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/{id}").hasAnyRole("ADMIN", "STAFF", "PATIENT", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/patient/**").hasAnyRole("ADMIN", "STAFF", "PATIENT", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/appointments/dentist/**").hasAnyRole("ADMIN", "STAFF", "DOCTOR")
                        .requestMatchers(HttpMethod.GET, "/api/appointments").hasAnyRole("ADMIN", "STAFF", "DOCTOR")
                        .requestMatchers("/api/appointments/**").hasAnyRole("ADMIN", "STAFF")

                        // Billing endpoints (Only ADMIN and STAFF can calculate/generate bills; PATIENT cannot generate bills)
                        .requestMatchers(HttpMethod.GET, "/api/bills/receipt/**").hasAnyRole("ADMIN", "STAFF", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/bills/{id}").hasAnyRole("ADMIN", "STAFF", "PATIENT")
                        .requestMatchers(HttpMethod.GET, "/api/bills/appointment/**").hasAnyRole("ADMIN", "STAFF", "PATIENT")
                        .requestMatchers("/api/bills/**").hasAnyRole("ADMIN", "STAFF")

                        // All other endpoints require authentication
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
