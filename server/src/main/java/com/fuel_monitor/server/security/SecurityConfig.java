package com.fuel_monitor.server.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService customUserDetailsService;

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. Public Endpoints
                        .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()

                        // 2. Admin Only
                        .requestMatchers(HttpMethod.GET, "/api/users").hasRole("ADMIN")

                        // 3. Fleet Manager Only (Vehicle Registration, Scheduling, Costs)
                        .requestMatchers(HttpMethod.POST, "/api/vehicles").hasRole("FLEET_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/vehicles/**").hasRole("FLEET_MANAGER")
                        .requestMatchers("/api/maintenance/schedule/**").hasRole("FLEET_MANAGER")
                        .requestMatchers("/api/costs/**").hasAnyRole("FLEET_MANAGER", "ADMIN")

                        // 4. Mechanic Only (Performing maintenance, resolving issues)
                        .requestMatchers("/api/maintenance/records/**").hasRole("MECHANIC")
                        .requestMatchers(HttpMethod.PUT, "/api/issues/*/acknowledge", "/api/issues/*/resolve").hasRole("MECHANIC")

                        // 5. Driver Only (Logging fuel, reporting issues)
                        .requestMatchers(HttpMethod.POST, "/api/fuel-logs/**").hasRole("DRIVER")
                        .requestMatchers(HttpMethod.POST, "/api/issues").hasRole("DRIVER")

                        // 6. Shared Read Access (GET requests)
                        .requestMatchers(HttpMethod.GET, "/api/vehicles/**").hasAnyRole("FLEET_MANAGER", "ADMIN", "MECHANIC", "DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/maintenance/**").hasAnyRole("FLEET_MANAGER", "ADMIN", "MECHANIC")
                        .requestMatchers(HttpMethod.GET, "/api/fuel-logs/**").hasAnyRole("FLEET_MANAGER", "ADMIN", "DRIVER")
                        .requestMatchers(HttpMethod.GET, "/api/issues/**").hasAnyRole("FLEET_MANAGER", "ADMIN", "MECHANIC", "DRIVER")

                        // 7. Catch-all for anything missed
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}