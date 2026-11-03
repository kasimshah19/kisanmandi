package com.kisanmandi.controller;

import com.kisanmandi.dto.*;
import com.kisanmandi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Authentication endpoints — register, login, refresh, logout, password recovery, verification, and session management
@Tag(name = "Authentication", description = "User registration, login, refresh, logout, password recovery, and verification")
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

    @Operation(summary = "Authenticate user and issue JWT bearer token + httpOnly refresh cookie")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid email or password"),
            @ApiResponse(responseCode = "429", description = "Too many login attempts — account locked")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        AuthResponse response = authService.login(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Rotate refresh token from cookie and issue new access token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Token refreshed successfully"),
            @ApiResponse(responseCode = "401", description = "Invalid, expired, or reused refresh token")
    })
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest httpRequest,
                                                HttpServletResponse httpResponse) {
        AuthResponse response = authService.refresh(httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Revoke token family and clear refresh cookie")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logged out successfully")
    })
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest httpRequest,
                                       HttpServletResponse httpResponse) {
        authService.logout(httpRequest, httpResponse);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Revoke all refresh tokens and bump tokenVersion across all devices")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Logged out from all devices successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/logout-all")
    public ResponseEntity<Void> logoutAll(HttpServletResponse httpResponse) {
        authService.logoutAll(httpResponse);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Change password for currently authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Current password invalid or validation error"),
            @ApiResponse(responseCode = "401", description = "Unauthorized"),
            @ApiResponse(responseCode = "429", description = "Too many failed attempts — locked")
    })
    @PutMapping("/password")
    public ResponseEntity<AuthResponse> changePasswordPut(@Valid @RequestBody ChangePasswordRequest request,
                                                          HttpServletRequest httpRequest,
                                                          HttpServletResponse httpResponse) {
        AuthResponse response = authService.changePassword(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    // Backwards compatibility endpoint
    @PostMapping("/change-password")
    public ResponseEntity<AuthResponse> changePasswordPost(@Valid @RequestBody ChangePasswordRequest request,
                                                           HttpServletRequest httpRequest,
                                                           HttpServletResponse httpResponse) {
        AuthResponse response = authService.changePassword(request, httpRequest, httpResponse);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Request password reset email")
    @ApiResponses({
            @ApiResponse(responseCode = "202", description = "Reset link processed (no user enumeration)")
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String message = authService.forgotPassword(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("message", message));
    }

    @Operation(summary = "Reset password using token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Password reset successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        String message = authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @Operation(summary = "Verify user email using token")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Email verified successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid or expired token")
    })
    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        String message = authService.verifyEmail(request);
        return ResponseEntity.ok(Map.of("message", message));
    }

    @Operation(summary = "Resend verification email to current user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Verification email dispatched"),
            @ApiResponse(responseCode = "400", description = "Email already verified"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PostMapping("/resend-verification")
    public ResponseEntity<Map<String, String>> resendVerification() {
        String message = authService.resendVerification();
        return ResponseEntity.ok(Map.of("message", message));
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

    @Operation(summary = "Update preferred language for authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Language updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid language"),
            @ApiResponse(responseCode = "401", description = "Unauthorized")
    })
    @PutMapping("/me/language")
    public ResponseEntity<Map<String, String>> updateLanguage(@Valid @RequestBody UpdateLanguageRequest request) {
        org.springframework.security.core.userdetails.UserDetails userDetails =
                (org.springframework.security.core.userdetails.UserDetails) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Long userId = (userDetails instanceof com.kisanmandi.security.CustomUserDetails cud)
                ? cud.getId()
                : authService.getCurrentUser().getId();
        authService.updateLanguage(userId, request.getLanguage());
        return ResponseEntity.ok(Map.of("message", "Language preference updated successfully"));
    }
}
