package com.kisanmandi.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

// TEMPORARY controller for testing RBAC — REMOVE after Phase 1 testing
@RestController
public class RoleTestController {

    // Only accessible by users with FARMER role
    @GetMapping("/api/farmer/ping")
    public Map<String, String> farmerPing() {
        return Map.of("message", "Hello FARMER");
    }

    // Only accessible by users with CUSTOMER role
    @GetMapping("/api/customer/ping")
    public Map<String, String> customerPing() {
        return Map.of("message", "Hello CUSTOMER");
    }

    // Only accessible by users with ADMIN role
    @GetMapping("/api/admin/ping")
    public Map<String, String> adminPing() {
        return Map.of("message", "Hello ADMIN");
    }
}
