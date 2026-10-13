package com.kisanmandi.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Health", description = "System and service health check")
@RestController
@RequestMapping("/api")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final Environment environment;

    public HealthController(JdbcTemplate jdbcTemplate, Environment environment) {
        this.jdbcTemplate = jdbcTemplate;
        this.environment = environment;
    }

    @Operation(summary = "Check backend and database health status")
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("appName", "kisanmandi-backend");
        response.put("version", "1.0.0");
        String[] profiles = environment.getActiveProfiles();
        response.put("profile", profiles.length > 0 ? profiles[0] : "local");
        response.put("time", LocalDateTime.now().toString());

        try {
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            response.put("database", "CONNECTED");
        } catch (Exception e) {
            response.put("database", "DOWN");
        }

        return response;
    }
}
