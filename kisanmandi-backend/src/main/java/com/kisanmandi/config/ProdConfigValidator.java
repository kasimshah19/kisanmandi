package com.kisanmandi.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("prod")
public class ProdConfigValidator {

    @Value("${spring.datasource.url:#{null}}")
    private String dbUrl;

    @Value("${app.jwt.secret:#{null}}")
    private String jwtSecret;

    @PostConstruct
    public void validate() {
        if (dbUrl == null || dbUrl.isBlank()) {
            throw new IllegalStateException("Production Configuration Error: DB_URL is missing. Please set DB_URL in environment variables.");
        }
        if (jwtSecret == null || jwtSecret.trim().length() < 32) {
            throw new IllegalStateException("Production Configuration Error: JWT_SECRET must be at least 32 characters long. Current length: " 
                    + (jwtSecret == null ? 0 : jwtSecret.trim().length()));
        }
    }
}
