package com.kisanmandi.controller;

import com.kisanmandi.dto.*;
import com.kisanmandi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Authentication endpoints — register, login, and get current user
@Tag(name = "Authentication", description = "User registration, login, and current profile")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Register a new CUSTOMER or FARMER account")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed"),
            @ApiResponse(responseCode = "409", description = "Email already registered")
    })
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", message));
    }

    @Operation(summary = "Authenticate user and issue JWT bearer token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid email or password"),
            @ApiResponse(responseCode = "429", description = "Too many login attempts")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Get currently authenticated user details")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile returned"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - Missing or invalid JWT")
    })
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }
}
