package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Handles registration, login, and fetching the current user
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    // ─── Register a new user ───
    @SuppressWarnings("null")
    public String register(RegisterRequest request) {
        // Only FARMER and CUSTOMER can register themselves
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed");
        }

        // Normalize email (lowercase, trim spaces)
        String email = request.getEmail().toLowerCase().trim();

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered: " + email);
        }

        // Build and save the user
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .build();

        userRepository.save(user);
        return "Registration successful! Please login.";
    }

    // ─── Login and return JWT token ───
    public AuthResponse login(LoginRequest request) {
        // Spring Security's AuthenticationManager checks email + password
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        // Load the user from DB to get their details
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow();

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ─── Get the currently logged-in user's profile ───
    public UserResponse getCurrentUser() {
        // Get the email from Spring Security context (set by JwtAuthFilter)
        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .build();
    }
}
