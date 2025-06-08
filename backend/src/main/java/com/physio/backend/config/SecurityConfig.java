package com.physio.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/**",
                                "/api/services/**",
                                "/api/blogs/**",
                                "/api/appointments/**",
                                "/api/patient-journey/**",
                                "/api/activityLogs/**",
                                "/api/securityLogs/**",
                                "/api/passwordChangeRequests/**",
                                "/api/patients/**"

                        ).permitAll()
                        .anyRequest().authenticated()
                )
                .httpBasic(); // Optional

        return http.build();
    }
}
