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

    @PostConstruct
    public void validate() {
        if (dbUrl == null || dbUrl.isBlank()) {
            throw new IllegalStateException("Production Configuration Error: DB_URL is missing. Please set DB_URL in environment variables.");
        }
    }
}
