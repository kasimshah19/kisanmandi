package com.kisanmandi.service;

import com.kisanmandi.dto.AuthResponse;
import com.kisanmandi.dto.LoginRequest;
import com.kisanmandi.dto.RegisterRequest;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserStatus;
import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private AuthenticationManager authenticationManager;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, passwordEncoder, jwtUtil, authenticationManager);
    }

    @Test
    @DisplayName("Register: Valid customer succeeds and stores hashed password")
    void register_success() {
        RegisterRequest request = new RegisterRequest("  Ramesh Kumar  ", "  Ramesh@Test.com  ", "password123", "9876543210", Role.CUSTOMER);
        when(userRepository.existsByEmail("ramesh@test.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("hashed_password");

        String result = authService.register(request);

        assertEquals("Registration successful! Please login.", result);
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User savedUser = userCaptor.getValue();
        assertEquals("Ramesh Kumar", savedUser.getName());
        assertEquals("ramesh@test.com", savedUser.getEmail());
        assertEquals("hashed_password", savedUser.getPassword());
        assertEquals(Role.CUSTOMER, savedUser.getRole());
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
    @DisplayName("Login: Valid credentials returns token and user info")
    void login_success() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "password123");
        User user = User.builder()
                .id(1L)
                .name("Ramesh")
                .email("ramesh@test.com")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("ramesh@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken("ramesh@test.com", "CUSTOMER")).thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("Ramesh", response.getName());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    @DisplayName("Login: Bad password throws BadCredentialsException")
    void login_badPassword_throwsBadCredentialsException() {
        LoginRequest request = new LoginRequest("ramesh@test.com", "wrongpassword");
        doThrow(new BadCredentialsException("Bad credentials"))
                .when(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));

        assertThrows(BadCredentialsException.class, () -> authService.login(request));
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
}
