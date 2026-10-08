package com.kisanmandi.controller;

import com.kisanmandi.dto.*;
import com.kisanmandi.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Authentication endpoints — register, login, and get current user
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // POST /api/auth/register — create a new FARMER or CUSTOMER account
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    // POST /api/auth/login — returns JWT token and user info
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // GET /api/auth/me — returns the logged-in user's profile (requires valid token)
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }
}
