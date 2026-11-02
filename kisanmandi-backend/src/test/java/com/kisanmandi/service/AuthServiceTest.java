package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.LoginAttempt;
import com.kisanmandi.entity.PasswordResetToken;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.exception.AccountLockedException;
import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.repository.EmailVerificationTokenRepository;
import com.kisanmandi.repository.LoginAttemptRepository;
import com.kisanmandi.repository.PasswordResetTokenRepository;
import com.kisanmandi.repository.RefreshTokenRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.ClientIpResolver;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.security.TokenHashUtil;
import org.springframework.context.ApplicationEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailVerificationTokenRepository emailVerificationTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private AppMetricsService appMetricsService;

    @Mock
    private EmailService emailService;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private LoginAttemptRepository loginAttemptRepository;

    @Mock
    private ClientIpResolver clientIpResolver;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordResetTokenRepository,
                emailVerificationTokenRepository,
                refreshTokenRepository,
                loginAttemptRepository,
                passwordEncoder,
                jwtUtil,
                authenticationManager,
                appMetricsService,
                emailService,
                clientIpResolver,
                eventPublisher
        );
    }

    @Test
    @DisplayName("Register: Valid customer succeeds and stores hashed password")
    void register_success() {
        RegisterRequest request = new RegisterRequest("  Ramesh Kumar  ", "  Ramesh@Test.com  ", "password123", "9876543210", Role.CUSTOMER);
        when(userRepository.existsByEmail("ramesh@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(i -> {
            User u = i.getArgument(0);
            u.setId(10L);
            return u;
        });

        String result = authService.register(request);

        assertEquals("Registration successful! Please login.", result);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Ramesh Kumar", savedUser.getName());
        assertEquals("ramesh@test.com", savedUser.getEmail());
        assertEquals("hashed_password", savedUser.getPassword());
        assertEquals(Role.CUSTOMER, savedUser.getRole());
        assertFalse(savedUser.isEmailVerified());
        assertEquals(1, savedUser.getTokenVersion());
    }

    @Test
    @DisplayName("Register: Duplicate email throws DuplicateEmailException")
    void register_duplicateEmail_throwsDuplicateEmailException() {
        RegisterRequest request = new RegisterRequest("Ramesh", "ramesh@test.com", "password123", "9876543210", Role.CUSTOMER);
        when(userRepository.existsByEmail("ramesh@test.com")).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Register: Attempting ADMIN registration throws IllegalArgumentException")
    void register_adminRole_throwsIllegalArgumentException() {
        RegisterRequest request = new RegisterRequest("Admin", "admin@test.com", "password123", "9876543210", Role.ADMIN);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        assertTrue(ex.getMessage().contains("Admin"));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Login: Valid credentials returns token and user info with tokenVersion")
    void login_success() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "password123");
        User user = User.builder()
                .id(1L)
                .name("Ramesh")
                .email("ramesh@test.com")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .tokenVersion(1)
                .emailVerified(true)
                .build();

        when(userRepository.findByEmail("ramesh@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("ramesh@test.com", "CUSTOMER", 1)).thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("Ramesh", response.getName());
        assertTrue(response.isEmailVerified());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Login: Bad password increments failed attempts")
    void login_badPassword_incrementsFailedAttempts() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "wrongpassword");
        LoginAttempt existingAttempt = LoginAttempt.builder()
                .emailKey("ramesh@test.com")
                .failedCount(2)
                .build();

        when(loginAttemptRepository.findById("ramesh@test.com")).thenReturn(Optional.of(existingAttempt));
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
        assertEquals(3, existingAttempt.getFailedCount());
        verify(loginAttemptRepository).save(existingAttempt);
    }

    @Test
    @DisplayName("Login: 5 failed attempts locks user account and throws AccountLockedException")
    void login_fiveFailedAttempts_locksAccount() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "wrongpassword");
        LoginAttempt existingAttempt = LoginAttempt.builder()
                .emailKey("ramesh@test.com")
                .failedCount(4)
                .build();

        when(loginAttemptRepository.findById("ramesh@test.com")).thenReturn(Optional.of(existingAttempt));
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> authService.login(request));
        assertEquals(5, existingAttempt.getFailedCount());
        assertNotNull(existingAttempt.getLockedUntil());
        verify(loginAttemptRepository).save(existingAttempt);
    }

    @Test
    @DisplayName("Login: Locked user throws AccountLockedException before auth check")
    void login_lockedUser_throwsLockedException() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "password123");
        LoginAttempt lockedAttempt = LoginAttempt.builder()
                .emailKey("ramesh@test.com")
                .failedCount(5)
                .lockedUntil(LocalDateTime.now().plusMinutes(10))
                .build();

        when(loginAttemptRepository.findById("ramesh@test.com")).thenReturn(Optional.of(lockedAttempt));

        AccountLockedException ex = assertThrows(AccountLockedException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("Too many failed attempts"));
        verify(authenticationManager, never()).authenticate(any());
    }

    @Test
    @DisplayName("Login: Blocked user throws DisabledException")
    void login_blockedUser_throwsDisabledException() {
        LoginRequest request = new LoginRequest("blocked@test.com", "password123");
        doThrow(new DisabledException("Your account has been blocked"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        DisabledException ex = assertThrows(DisabledException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("blocked"));
    }

    @Test
    @DisplayName("ForgotPassword: Unknown email returns generic message without error")
    void forgotPassword_unknownEmail_returnsGenericMessage() {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@test.com");
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());

        String message = authService.forgotPassword(request);
        assertEquals("If that email is registered, password reset instructions have been sent.", message);
        verify(passwordResetTokenRepository, never()).save(any());
    }

    @Test
    @DisplayName("ResetPassword: Valid token resets password and revokes previous tokens")
    void resetPassword_validToken_resetsPassword() {
        String rawToken = "my_reset_token_1234567890abcdef1234567890abcdef";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        User user = User.builder()
                .id(1L)
                .email("user@test.com")
                .password("old_hash")
                .tokenVersion(1)
                .failedLoginAttempts(3)
                .build();

        PasswordResetToken token = PasswordResetToken.builder()
                .id(5L)
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();

        when(passwordResetTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("newPassword123")).thenReturn("new_hash");

        ResetPasswordRequest request = new ResetPasswordRequest(rawToken, "newPassword123");
        String message = authService.resetPassword(request);

        assertTrue(message.contains("reset successfully"));
        assertEquals("new_hash", user.getPassword());
        assertEquals(2, user.getTokenVersion());
        assertEquals(0, user.getFailedLoginAttempts());
        assertTrue(token.isUsed());
        verify(userRepository).save(user);
    }
}
