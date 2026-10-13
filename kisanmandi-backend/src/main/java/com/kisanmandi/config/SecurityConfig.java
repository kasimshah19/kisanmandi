package com.kisanmandi.config;

import com.kisanmandi.security.JwtAccessDeniedHandler;
import com.kisanmandi.security.JwtAuthEntryPoint;
import com.kisanmandi.security.JwtAuthFilter;
import com.kisanmandi.security.RateLimitFilter;
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
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final JwtAuthEntryPoint jwtAuthEntryPoint;
    private final JwtAccessDeniedHandler jwtAccessDeniedHandler;
    private final RateLimitFilter rateLimitFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                          JwtAuthEntryPoint jwtAuthEntryPoint,
                          JwtAccessDeniedHandler jwtAccessDeniedHandler,
                          RateLimitFilter rateLimitFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.jwtAuthEntryPoint = jwtAuthEntryPoint;
        this.jwtAccessDeniedHandler = jwtAccessDeniedHandler;
        this.rateLimitFilter = rateLimitFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (we use JWT tokens, not cookies)
            .csrf(csrf -> csrf.disable())
            // Enable CORS (uses configured CorsConfigurationSource)
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            // No sessions — each request carries its own JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Custom 401 and 403 JSON responses
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthEntryPoint)
                .accessDeniedHandler(jwtAccessDeniedHandler)
            )
            // URL-based authorization rules
            .authorizeHttpRequests(auth -> auth
                // CORS preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Internal cron sync endpoint (protected only via X-Cron-Token header)
                .requestMatchers(HttpMethod.POST, "/api/internal/mandi/sync").permitAll()
                // Public endpoints — no token needed
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/health",
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // Public product, category and mandi browsing
                .requestMatchers(HttpMethod.GET, "/api/products/**", "/api/categories/**", "/api/mandi/**").permitAll()
                // Role-based access (farmer, customer, admin sections)
                .requestMatchers("/api/farmer/**").hasRole("FARMER")
                .requestMatchers("/api/customer/**").hasRole("CUSTOMER")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Everything else requires login
                .anyRequest().authenticated()
            )
            // Rate limit before auth filter (LogoutFilter comes before UsernamePasswordAuthenticationFilter)
            .addFilterBefore(rateLimitFilter, org.springframework.security.web.authentication.logout.LogoutFilter.class)
            // Add our JWT filter before Spring's default username/password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Password encoder for hashing passwords with BCrypt
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // AuthenticationManager is needed by AuthService for login
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
