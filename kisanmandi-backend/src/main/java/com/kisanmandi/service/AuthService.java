package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.EmailVerificationToken;
import com.kisanmandi.entity.PasswordResetToken;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.repository.EmailVerificationTokenRepository;
import com.kisanmandi.repository.PasswordResetTokenRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.security.TokenHashUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

// Handles registration, login, password recovery, verification, and session management
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AppMetricsService appMetricsService;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       AppMetricsService appMetricsService,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.appMetricsService = appMetricsService;
        this.emailService = emailService;
    }

    // ─── Register a new user ───
    @Transactional
    public String register(RegisterRequest request) {
        // Only FARMER and CUSTOMER can register themselves
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed");
        }

        // Normalize email (lowercase, trim spaces)
        String email = request.getEmail().toLowerCase().trim();

        // Check if email already exists
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        // Build and save the user
        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .emailVerified(false)
                .tokenVersion(1)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        // Generate email verification token and trigger verification email
        try {
            String rawToken = TokenHashUtil.generateRandomToken();
            String tokenHash = TokenHashUtil.hashToken(rawToken);

            EmailVerificationToken token = EmailVerificationToken.builder()
                    .user(user)
                    .tokenHash(tokenHash)
                    .expiresAt(LocalDateTime.now().plusHours(24))
                    .used(false)
                    .build();
            emailVerificationTokenRepository.save(token);

            String verifyLink = frontendUrl + "/verify-email?token=" + rawToken;
            emailService.sendEmailVerificationEmail(user.getEmail(), verifyLink);
        } catch (Exception ex) {
            log.warn("Failed to generate or send verification email on register: {}", ex.getMessage());
        }

        return "Registration successful! Please login.";
    }

    // ─── Login and return JWT token ───
    @Transactional(noRollbackFor = {BadCredentialsException.class, LockedException.class})
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        // Pre-check for account lockout
        if (userOpt.isPresent()) {
            User existing = userOpt.get();
            if (existing.getLockoutUntil() != null && existing.getLockoutUntil().isAfter(LocalDateTime.now())) {
                long minutesLeft = Duration.between(LocalDateTime.now(), existing.getLockoutUntil()).toMinutes() + 1;
                appMetricsService.incrementAuthLogin("locked");
                throw new LockedException(
                    "Account is temporarily locked due to multiple failed login attempts. Try again in " +
                    minutesLeft + " minutes or reset your password."
                );
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
            appMetricsService.incrementAuthLogin("success");
        } catch (BadCredentialsException ex) {
            appMetricsService.incrementAuthLogin("failure");

            if (userOpt.isPresent()) {
                User user = userOpt.get();
                int attempts = user.getFailedLoginAttempts() + 1;
                user.setFailedLoginAttempts(attempts);

                if (attempts >= MAX_FAILED_ATTEMPTS) {
                    user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                    log.warn("User account {} locked for {} minutes after {} failed attempts",
                            email, LOCKOUT_MINUTES, attempts);
                }
                userRepository.save(user);
            }

            throw new BadCredentialsException("Invalid email or password");
        } catch (Exception ex) {
            appMetricsService.incrementAuthLogin("failure");
            throw ex;
        }

        User user = userOpt.orElseThrow();

        // Reset failed login counter on success
        if (user.getFailedLoginAttempts() > 0 || user.getLockoutUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);
        }

        // Generate JWT token with tokenVersion
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .build();
    }

    // ─── Forgot Password (No user enumeration) ───
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            try {
                // Invalidate any existing unused tokens for this user
                passwordResetTokenRepository.deleteByUser(user);

                // Generate secure random token
                String rawToken = TokenHashUtil.generateRandomToken();
                String tokenHash = TokenHashUtil.hashToken(rawToken);

                PasswordResetToken resetToken = PasswordResetToken.builder()
                        .user(user)
                        .tokenHash(tokenHash)
                        .expiresAt(LocalDateTime.now().plusHours(1))
                        .used(false)
                        .build();

                passwordResetTokenRepository.save(resetToken);

                String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
                emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            } catch (Exception e) {
                log.error("Error creating password reset token for {}: {}", email, e.getMessage());
            }
        }

        // Constant response regardless of whether email exists
        return "If that email is registered, password reset instructions have been sent.";
    }

    // ─── Reset Password using Token ───
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        String tokenHash = TokenHashUtil.hashToken(request.getToken().trim());
        PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link"));

        if (token.isUsed() || token.isExpired()) {
            throw new IllegalArgumentException("Invalid or expired password reset link");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setTokenVersion(user.getTokenVersion() + 1); // Revoke all previous JWTs
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        token.setUsed(true);
        passwordResetTokenRepository.save(token);

        log.info("Password successfully reset for user id {}", user.getId());
        return "Password reset successfully. Please log in with your new password.";
    }

    // ─── Change Password for Logged-In User ───
    @Transactional
    public String changePassword(ChangePasswordRequest request) {
        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new IllegalArgumentException("New password must be at least 8 characters long");
        }

        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as your current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidate other sessions
        userRepository.save(user);

        log.info("Password successfully changed for user id {}", user.getId());
        return "Password changed successfully. Please log in again.";
    }

    // ─── Verify Email using Token ───
    @Transactional
    public String verifyEmail(VerifyEmailRequest request) {
        String tokenHash = TokenHashUtil.hashToken(request.getToken().trim());
        EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired email verification link"));

        if (token.isUsed() || token.isExpired()) {
            throw new IllegalArgumentException("Invalid or expired email verification link");
        }

        User user = token.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        emailVerificationTokenRepository.save(token);

        log.info("Email verified successfully for user id {}", user.getId());
        return "Email verified successfully!";
    }

    // ─── Resend Verification Email for Logged-In User ───
    @Transactional
    public String resendVerification() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Your email is already verified");
        }

        emailVerificationTokenRepository.deleteByUser(user);

        String rawToken = TokenHashUtil.generateRandomToken();
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        emailVerificationTokenRepository.save(token);

        String verifyLink = frontendUrl + "/verify-email?token=" + rawToken;
        emailService.sendEmailVerificationEmail(user.getEmail(), verifyLink);

        return "Verification email sent. Please check your inbox.";
    }

    // ─── Server-Side Logout (Revoke Token) ───
    @Transactional
    public String logout() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetails userDetails) {
            userRepository.findByEmail(userDetails.getUsername()).ifPresent(user -> {
                user.setTokenVersion(user.getTokenVersion() + 1);
                userRepository.save(user);
                log.info("User id {} logged out and tokenVersion incremented", user.getId());
            });
        }
        return "Logged out successfully.";
    }

    // ─── Get the currently logged-in user's profile ───
    public UserResponse getCurrentUser() {
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
                .emailVerified(user.isEmailVerified())
                .build();
    }
}
