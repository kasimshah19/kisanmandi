package com.kisanmandi.service;

import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.event.PasswordChangedEvent;
import com.kisanmandi.exception.AccountLockedException;
import com.kisanmandi.exception.DuplicateEmailException;
import com.kisanmandi.repository.*;
import com.kisanmandi.security.ClientIpResolver;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.security.PasswordPolicy;
import com.kisanmandi.security.TokenHashUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;
    public static final String REFRESH_COOKIE_NAME = "km_refresh";

    private final UserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final UserTokenService userTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final AppMetricsService appMetricsService;
    private final EmailService emailService;
    private final ClientIpResolver clientIpResolver;
    private final ApplicationEventPublisher eventPublisher;

    private final SecureRandom secureRandom = new SecureRandom();
    private final java.util.concurrent.ConcurrentHashMap<String, java.util.Deque<Long>> forgotPasswordEmailAttempts = new java.util.concurrent.ConcurrentHashMap<>();

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.auth.refresh-ttl-days:14}")
    private int refreshTtlDays;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @org.springframework.beans.factory.annotation.Autowired
    public AuthService(UserRepository userRepository,
                       UserTokenRepository userTokenRepository,
                       UserTokenService userTokenService,
                       RefreshTokenRepository refreshTokenRepository,
                       LoginAttemptRepository loginAttemptRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       AppMetricsService appMetricsService,
                       EmailService emailService,
                       ClientIpResolver clientIpResolver,
                       ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.userTokenRepository = userTokenRepository;
        this.userTokenService = userTokenService;
        this.passwordResetTokenRepository = null;
        this.emailVerificationTokenRepository = null;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.appMetricsService = appMetricsService;
        this.emailService = emailService;
        this.clientIpResolver = clientIpResolver;
        this.eventPublisher = eventPublisher;
    }

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       EmailVerificationTokenRepository emailVerificationTokenRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       LoginAttemptRepository loginAttemptRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       AppMetricsService appMetricsService,
                       EmailService emailService,
                       ClientIpResolver clientIpResolver,
                       ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.userTokenRepository = null;
        this.userTokenService = null;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.appMetricsService = appMetricsService;
        this.emailService = emailService;
        this.clientIpResolver = clientIpResolver;
        this.eventPublisher = eventPublisher;
    }

    // ─── Register a new user ───
    @Transactional
    public String register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("Admin registration is not allowed");
        }

        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("Email is already registered");
        }

        String lang = (request.getLanguage() != null && !request.getLanguage().isBlank())
                ? request.getLanguage().toLowerCase(Locale.ROOT).trim()
                : "en";
        if (!List.of("en", "hi", "mr").contains(lang)) {
            lang = "en";
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole())
                .emailVerified(false)
                .preferredLanguage(lang)
                .tokenVersion(1)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        try {
            if (userTokenService != null) {
                String rawToken = userTokenService.createToken(user, UserTokenType.VERIFY_EMAIL);
                String verifyLink = frontendUrl + "/verify-email#token=" + rawToken;
                eventPublisher.publishEvent(new com.kisanmandi.event.SendEmailEvent(
                        com.kisanmandi.event.EmailType.VERIFY_EMAIL,
                        user.getEmail(),
                        user.getName(),
                        verifyLink,
                        user.getPreferredLanguage()
                ));
            } else if (emailVerificationTokenRepository != null) {
                String rawToken = TokenHashUtil.generateRandomToken();
                String tokenHash = TokenHashUtil.hashToken(rawToken);

                EmailVerificationToken token = EmailVerificationToken.builder()
                        .user(user)
                        .tokenHash(tokenHash)
                        .expiresAt(LocalDateTime.now().plusHours(24))
                        .used(false)
                        .build();
                emailVerificationTokenRepository.save(token);

                String verifyLink = frontendUrl + "/verify-email#token=" + rawToken;
                emailService.sendEmailVerificationEmail(user.getEmail(), verifyLink);
            }
        } catch (Exception ex) {
            log.warn("Failed to generate or send verification email on register: {}", ex.getMessage());
        }

        return "Registration successful! Please login.";
    }

    // Overload for testing and backward compatibility
    @Transactional(noRollbackFor = {BadCredentialsException.class, AccountLockedException.class})
    public AuthResponse login(LoginRequest request) {
        return login(request, null, null);
    }

    // ─── Login and return JWT token + Set-Cookie refresh token ───
    @Transactional(noRollbackFor = {BadCredentialsException.class, AccountLockedException.class})
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();

        // Check account lockout via login_attempts (works identically for non-existent users)
        Optional<LoginAttempt> attemptOpt = loginAttemptRepository.findById(email);
        if (attemptOpt.isPresent()) {
            LoginAttempt attempt = attemptOpt.get();
            if (attempt.isLocked()) {
                long retryAfterSeconds = Math.max(1, Duration.between(LocalDateTime.now(), attempt.getLockedUntil()).getSeconds());
                long minutesLeft = Math.max(1, (retryAfterSeconds + 59) / 60);
                appMetricsService.incrementAuthLogin("locked");
                log.warn("Login rejected: account is locked. requestId={}", MDC.get("requestId"));
                throw new AccountLockedException(
                        "Too many failed attempts. Please try again after " + minutesLeft + " minutes.",
                        retryAfterSeconds
                );
            } else if (attempt.getLastFailedAt() != null &&
                    Duration.between(attempt.getLastFailedAt(), LocalDateTime.now()).toMinutes() >= LOCKOUT_MINUTES) {
                // Window expired: reset failed attempts
                attempt.setFailedCount(0);
                attempt.setLockedUntil(null);
                loginAttemptRepository.save(attempt);
            }
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            LoginAttempt attempt = attemptOpt.orElseGet(() -> LoginAttempt.builder().emailKey(email).failedCount(0).build());
            int newCount = attempt.getFailedCount() + 1;
            attempt.setFailedCount(newCount);
            attempt.setLastFailedAt(LocalDateTime.now());

            if (newCount >= MAX_FAILED_ATTEMPTS) {
                attempt.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                loginAttemptRepository.save(attempt);
                appMetricsService.incrementAuthLogin("locked");
                log.warn("Login failed: account locked after {} failed attempts. requestId={}", newCount, MDC.get("requestId"));
                long retryAfterSeconds = LOCKOUT_MINUTES * 60L;
                throw new AccountLockedException(
                        "Too many failed attempts. Please try again after " + LOCKOUT_MINUTES + " minutes.",
                        retryAfterSeconds
                );
            }

            loginAttemptRepository.save(attempt);
            appMetricsService.incrementAuthLogin("failure");
            log.info("Auth event: login_failure. requestId={}", MDC.get("requestId"));
            throw new BadCredentialsException("Invalid email or password");
        }

        // On authentication success: reset login_attempts
        attemptOpt.ifPresent(attempt -> {
            attempt.setFailedCount(0);
            attempt.setLockedUntil(null);
            loginAttemptRepository.save(attempt);
        });

        User user = userRepository.findByEmail(email).orElseThrow();
        if (user.getStatus() == UserStatus.BLOCKED) {
            log.warn("Login rejected for blocked user id {}", user.getId());
            throw new DisabledException("Your account is blocked");
        }

        if (user.getFailedLoginAttempts() > 0 || user.getLockoutUntil() != null) {
            user.setFailedLoginAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);
        }

        // Generate short-lived access token (15m)
        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());

        // Generate rotating refresh token (14 days)
        String rawRefreshToken = generateOpaqueToken();
        String tokenHash = TokenHashUtil.hashToken(rawRefreshToken);
        String familyId = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(refreshTtlDays))
                .createdIp(clientIpResolver.resolveClientIp(httpRequest))
                .userAgent(truncate(httpRequest != null ? httpRequest.getHeader("User-Agent") : null, 200))
                .build();
        refreshTokenRepository.save(refreshToken);

        if (httpResponse != null) {
            ResponseCookie cookie = createRefreshCookie(rawRefreshToken);
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        log.info("Auth event: login_success. userId={}, requestId={}", user.getId(), MDC.get("requestId"));
        appMetricsService.incrementAuthLogin("success");

        return AuthResponse.builder()
                .token(accessToken)
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    // ─── Rotate Refresh Token (POST /api/auth/refresh) ───
    @Transactional
    public AuthResponse refresh(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        // 1. Verify CSRF defense header
        String requestedWith = httpRequest.getHeader("X-Requested-With");
        if (!"km-web".equals(requestedWith)) {
            log.warn("Refresh rejected: invalid or missing X-Requested-With header. requestId={}", MDC.get("requestId"));
            clearRefreshCookie(httpResponse);
            throw new BadCredentialsException("Missing or invalid X-Requested-With header");
        }

        // 2. Validate Origin / Referer host
        validateOriginOrReferer(httpRequest);

        // 3. Extract cookie
        String rawRefreshToken = extractCookie(httpRequest, REFRESH_COOKIE_NAME);
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            clearRefreshCookie(httpResponse);
            throw new BadCredentialsException("Missing refresh token cookie");
        }

        String tokenHash = TokenHashUtil.hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElse(null);

        if (token == null) {
            clearRefreshCookie(httpResponse);
            throw new BadCredentialsException("Invalid refresh token");
        }

        User user = token.getUser();
        if (user.getStatus() == UserStatus.BLOCKED) {
            clearRefreshCookie(httpResponse);
            log.warn("Refresh rejected for blocked user id {}", user.getId());
            throw new BadCredentialsException("Account is blocked");
        }

        if (token.isExpired()) {
            clearRefreshCookie(httpResponse);
            throw new BadCredentialsException("Refresh token has expired");
        }

        // 4. Handle Reuse Detection and Grace Window
        if (token.isRevoked()) {
            long secondsSinceRevoked = Duration.between(token.getRevokedAt(), LocalDateTime.now()).getSeconds();
            if (secondsSinceRevoked >= 0 && secondsSinceRevoked <= 10) {
                // Inside 10-second grace window: return valid access token without forking family
                String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
                log.info("Auth event: refresh_grace_window. userId={}, familyId={}, requestId={}",
                        user.getId(), token.getFamilyId(), MDC.get("requestId"));
                appMetricsService.incrementAuthRefresh("grace");
                return AuthResponse.builder()
                        .token(accessToken)
                        .expiresIn(jwtUtil.getExpirationMs() / 1000)
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .emailVerified(user.isEmailVerified())
                        .build();
            } else {
                // REUSE DETECTED outside grace window: revoke entire token family
                refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now());
                clearRefreshCookie(httpResponse);
                log.warn("Auth event: refresh_reuse_detected. userId={}, familyId={}, requestId={}",
                        user.getId(), token.getFamilyId(), MDC.get("requestId"));
                appMetricsService.incrementAuthRefreshReuse();
                appMetricsService.incrementAuthRefresh("reuse_revoked");
                throw new BadCredentialsException("Refresh token reuse detected. Family revoked.");
            }
        }

        // 5. Normal Token Rotation
        token.setRevokedAt(LocalDateTime.now());

        String newRawToken = generateOpaqueToken();
        String newTokenHash = TokenHashUtil.hashToken(newRawToken);

        RefreshToken nextToken = RefreshToken.builder()
                .user(user)
                .tokenHash(newTokenHash)
                .familyId(token.getFamilyId())
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(refreshTtlDays))
                .createdIp(clientIpResolver.resolveClientIp(httpRequest))
                .userAgent(truncate(httpRequest.getHeader("User-Agent"), 200))
                .build();
        nextToken = refreshTokenRepository.save(nextToken);

        token.setReplacedById(nextToken.getId());
        refreshTokenRepository.save(token);

        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
        ResponseCookie cookie = createRefreshCookie(newRawToken);
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        log.info("Auth event: refresh_success. userId={}, familyId={}, requestId={}",
                user.getId(), token.getFamilyId(), MDC.get("requestId"));
        appMetricsService.incrementAuthRefresh("success");

        return AuthResponse.builder()
                .token(accessToken)
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    // ─── Logout (POST /api/auth/logout) ───
    @Transactional
    public void logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        String rawRefreshToken = extractCookie(httpRequest, REFRESH_COOKIE_NAME);
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String tokenHash = TokenHashUtil.hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(token -> {
                refreshTokenRepository.revokeFamily(token.getFamilyId(), LocalDateTime.now());
                log.info("Auth event: logout. userId={}, familyId={}, requestId={}",
                        token.getUser().getId(), token.getFamilyId(), MDC.get("requestId"));
            });
        }
        clearRefreshCookie(httpResponse);
    }

    // ─── Logout Everywhere (POST /api/auth/logout-all) ───
    @Transactional
    public void logoutAll(HttpServletResponse httpResponse) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user.getId(), LocalDateTime.now());
        clearRefreshCookie(httpResponse);

        log.info("Auth event: logout_all. userId={}, requestId={}", user.getId(), MDC.get("requestId"));
    }

    // ─── Change Password (PUT /api/auth/password) ───
    @Transactional(noRollbackFor = {IllegalArgumentException.class, AccountLockedException.class})
    public AuthResponse changePassword(ChangePasswordRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String lockoutKey = "pw:" + user.getId();
        Optional<LoginAttempt> attemptOpt = loginAttemptRepository.findById(lockoutKey);
        if (attemptOpt.isPresent()) {
            LoginAttempt attempt = attemptOpt.get();
            if (attempt.isLocked()) {
                long retryAfterSeconds = Math.max(1, Duration.between(LocalDateTime.now(), attempt.getLockedUntil()).getSeconds());
                long minutesLeft = Math.max(1, (retryAfterSeconds + 59) / 60);
                throw new AccountLockedException(
                        "Too many failed password change attempts. Please try again after " + minutesLeft + " minutes.",
                        retryAfterSeconds
                );
            } else if (attempt.getLastFailedAt() != null &&
                    Duration.between(attempt.getLastFailedAt(), LocalDateTime.now()).toMinutes() >= LOCKOUT_MINUTES) {
                attempt.setFailedCount(0);
                attempt.setLockedUntil(null);
                loginAttemptRepository.save(attempt);
            }
        }

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            LoginAttempt attempt = attemptOpt.orElseGet(() -> LoginAttempt.builder().emailKey(lockoutKey).failedCount(0).build());
            int newCount = attempt.getFailedCount() + 1;
            attempt.setFailedCount(newCount);
            attempt.setLastFailedAt(LocalDateTime.now());
            if (newCount >= MAX_FAILED_ATTEMPTS) {
                attempt.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_MINUTES));
                loginAttemptRepository.save(attempt);
                long retryAfterSeconds = LOCKOUT_MINUTES * 60L;
                throw new AccountLockedException(
                        "Too many failed password change attempts. Please try again after " + LOCKOUT_MINUTES + " minutes.",
                        retryAfterSeconds
                );
            }
            loginAttemptRepository.save(attempt);
            throw new IllegalArgumentException("Current password is incorrect");
        }

        // On correct current password: reset attempt counter
        attemptOpt.ifPresent(attempt -> {
            attempt.setFailedCount(0);
            attempt.setLockedUntil(null);
            loginAttemptRepository.save(attempt);
        });

        // Validate new password with policy
        List<String> policyErrors = PasswordPolicy.validate(request.getNewPassword(), user.getEmail());
        if (!policyErrors.isEmpty()) {
            throw new IllegalArgumentException(policyErrors.get(0));
        }

        // Reject same-as-current password
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be the same as your current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setTokenVersion(user.getTokenVersion() + 1); // Invalidates all other active access tokens
        userRepository.save(user);

        // Revoke all existing refresh tokens for this user
        refreshTokenRepository.revokeAllByUser(user.getId(), LocalDateTime.now());

        // Issue fresh session for THIS device
        String accessToken = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getTokenVersion());
        String rawRefreshToken = generateOpaqueToken();
        String tokenHash = TokenHashUtil.hashToken(rawRefreshToken);
        String familyId = UUID.randomUUID().toString();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .familyId(familyId)
                .createdAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(refreshTtlDays))
                .createdIp(clientIpResolver.resolveClientIp(httpRequest))
                .userAgent(truncate(httpRequest != null ? httpRequest.getHeader("User-Agent") : null, 200))
                .build();
        refreshTokenRepository.save(refreshToken);

        if (httpResponse != null) {
            ResponseCookie cookie = createRefreshCookie(rawRefreshToken);
            httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }

        eventPublisher.publishEvent(new PasswordChangedEvent(user.getId(), user.getEmail(), MDC.get("requestId")));
        log.info("Auth event: password_changed. userId={}, requestId={}", user.getId(), MDC.get("requestId"));

        return AuthResponse.builder()
                .token(accessToken)
                .expiresIn(jwtUtil.getExpirationMs() / 1000)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.isEmailVerified())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    // ─── Forgot Password (No user enumeration + Rate Limited) ───
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase(Locale.ROOT).trim();

        // 1. Sliding window rate limit per email (3 requests per hour)
        long now = System.currentTimeMillis();
        long window = 3600_000L;
        java.util.Deque<Long> timestamps = forgotPasswordEmailAttempts.computeIfAbsent(email, k -> new java.util.ArrayDeque<>());
        long retryAfter = 3600;
        boolean rateLimited = false;

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && now - timestamps.peekFirst() > window) {
                timestamps.pollFirst();
            }
            if (timestamps.size() >= 3) {
                rateLimited = true;
                long oldest = timestamps.peekFirst() != null ? timestamps.peekFirst() : now;
                retryAfter = Math.max(1, (oldest + window - now) / 1000);
            } else {
                timestamps.addLast(now);
            }
        }

        if (rateLimited) {
            log.warn("Password reset rate limited for email. requestId={}", MDC.get("requestId"));
            throw new com.kisanmandi.exception.RateLimitExceededException(
                    "Too many password reset requests. Please try again after " + Math.max(1, (retryAfter + 59) / 60) + " minutes.",
                    retryAfter
            );
        }

        // 2. Prevent user enumeration: identical body and timing whether user exists or not
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            try {
                if (userTokenService != null) {
                    String rawToken = userTokenService.createToken(user, UserTokenType.RESET_PASSWORD);
                    String resetLink = frontendUrl + "/reset-password#token=" + rawToken;
                    eventPublisher.publishEvent(new com.kisanmandi.event.SendEmailEvent(
                            com.kisanmandi.event.EmailType.RESET_PASSWORD,
                            user.getEmail(),
                            user.getName(),
                            resetLink,
                            user.getPreferredLanguage()
                    ));
                    log.info("Password reset token generated and email dispatched for user id {}", user.getId());
                } else if (passwordResetTokenRepository != null) {
                    passwordResetTokenRepository.deleteByUser(user);
                    String rawToken = TokenHashUtil.generateRandomToken();
                    String tokenHash = TokenHashUtil.hashToken(rawToken);
                    PasswordResetToken resetToken = PasswordResetToken.builder()
                            .user(user)
                            .tokenHash(tokenHash)
                            .expiresAt(LocalDateTime.now().plusHours(1))
                            .used(false)
                            .build();
                    passwordResetTokenRepository.save(resetToken);
                    String resetLink = frontendUrl + "/reset-password#token=" + rawToken;
                    emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
                }
            } catch (Exception e) {
                log.error("Error creating password reset token for user ID {}: {}", user.getId(), e.getMessage());
            }
        } else {
            // Constant-time dummy work to prevent timing side-channel
            passwordEncoder.matches("dummyPassword", "$2a$10$wK1.V6dY6Hh1m.K/Wv1.YeP.q.12345678901234567890123");
        }

        return "If that email is registered, password reset instructions have been sent.";
    }

    // ─── Reset Password using Token ───
    @Transactional
    public String resetPassword(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("Token is required");
        }

        User user;
        if (userTokenService != null) {
            user = userTokenService.consumeToken(request.getToken(), UserTokenType.RESET_PASSWORD);
        } else if (passwordResetTokenRepository != null) {
            String tokenHash = TokenHashUtil.hashToken(request.getToken().trim());
            PasswordResetToken token = passwordResetTokenRepository.findByTokenHash(tokenHash)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset link"));
            if (token.isUsed() || token.isExpired()) {
                throw new IllegalArgumentException("Invalid or expired password reset link");
            }
            token.setUsed(true);
            passwordResetTokenRepository.save(token);
            user = token.getUser();
        } else {
            throw new IllegalStateException("Token service unavailable");
        }

        List<String> policyErrors = PasswordPolicy.validate(request.getNewPassword(), user.getEmail());
        if (!policyErrors.isEmpty()) {
            throw new IllegalArgumentException(policyErrors.get(0));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordChangedAt(LocalDateTime.now());
        user.setTokenVersion(user.getTokenVersion() + 1); // Revoke all previous JWTs
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        // Revoke all refresh tokens
        refreshTokenRepository.revokeAllByUser(user.getId(), LocalDateTime.now());

        // Clear email lockout if any
        loginAttemptRepository.findById(user.getEmail()).ifPresent(attempt -> {
            attempt.setFailedCount(0);
            attempt.setLockedUntil(null);
            loginAttemptRepository.save(attempt);
        });

        eventPublisher.publishEvent(new PasswordChangedEvent(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPreferredLanguage(),
                MDC.get("requestId")
        ));
        log.info("Auth event: password_reset. userId={}, requestId={}", user.getId(), MDC.get("requestId"));

        return "Password reset successfully. Please log in with your new password.";
    }

    // ─── Verify Email using Token ───
    @Transactional
    public String verifyEmail(VerifyEmailRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw new IllegalArgumentException("Token is required");
        }

        User user;
        if (userTokenService != null) {
            user = userTokenService.consumeToken(request.getToken(), UserTokenType.VERIFY_EMAIL);
        } else if (emailVerificationTokenRepository != null) {
            String tokenHash = TokenHashUtil.hashToken(request.getToken().trim());
            EmailVerificationToken token = emailVerificationTokenRepository.findByTokenHash(tokenHash)
                    .orElseThrow(() -> new IllegalArgumentException("Invalid or expired email verification link"));
            if (token.isUsed() || token.isExpired()) {
                throw new IllegalArgumentException("Invalid or expired email verification link");
            }
            token.setUsed(true);
            emailVerificationTokenRepository.save(token);
            user = token.getUser();
        } else {
            throw new IllegalStateException("Token service unavailable");
        }

        if (!user.isEmailVerified()) {
            user.setEmailVerified(true);
            user.setEmailVerifiedAt(LocalDateTime.now());
            userRepository.save(user);
        }

        log.info("Auth event: email_verified. userId={}, requestId={}", user.getId(), MDC.get("requestId"));
        return "Email verified successfully!";
    }

    // ─── Resend Verification Email for Logged-In User ───
    @Transactional
    public String resendVerification(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.isEmailVerified()) {
            throw new IllegalStateException("Your email is already verified");
        }

        // 1. Cooldown check (60 seconds)
        if (userTokenRepository != null) {
            Optional<UserToken> latestOpt = userTokenRepository.findTopByUserIdAndTypeOrderByCreatedAtDesc(user.getId(), UserTokenType.VERIFY_EMAIL);
            if (latestOpt.isPresent()) {
                long secondsSince = Duration.between(latestOpt.get().getCreatedAt(), LocalDateTime.now()).getSeconds();
                if (secondsSince >= 0 && secondsSince < 60) {
                    long retryAfter = 60 - secondsSince;
                    throw new com.kisanmandi.exception.RateLimitExceededException(
                            "Please wait " + retryAfter + " seconds before requesting another verification email.",
                            retryAfter
                    );
                }
            }

            // 2. Daily limit check (max 5 per day)
            LocalDateTime oneDayAgo = LocalDateTime.now().minusHours(24);
            int count = userTokenRepository.countByUserIdAndTypeAndCreatedAtAfter(user.getId(), UserTokenType.VERIFY_EMAIL, oneDayAgo);
            if (count >= 5) {
                throw new com.kisanmandi.exception.RateLimitExceededException(
                        "Maximum verification emails reached for today. Please try again tomorrow.",
                        3600
                );
            }
        }

        if (userTokenService != null) {
            String rawToken = userTokenService.createToken(user, UserTokenType.VERIFY_EMAIL);
            String verifyLink = frontendUrl + "/verify-email#token=" + rawToken;
            eventPublisher.publishEvent(new com.kisanmandi.event.SendEmailEvent(
                    com.kisanmandi.event.EmailType.VERIFY_EMAIL,
                    user.getEmail(),
                    user.getName(),
                    verifyLink,
                    user.getPreferredLanguage()
            ));
        } else if (emailVerificationTokenRepository != null) {
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
            String verifyLink = frontendUrl + "/verify-email#token=" + rawToken;
            emailService.sendEmailVerificationEmail(user.getEmail(), verifyLink);
        }

        return "Verification email sent. Please check your inbox.";
    }

    @Transactional
    public String resendVerification() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return resendVerification(user.getId());
    }

    // ─── Update User Preferred Language ───
    @Transactional
    public void updateLanguage(Long userId, String language) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String lang = language != null ? language.toLowerCase(Locale.ROOT).trim() : "en";
        if (List.of("en", "hi", "mr").contains(lang)) {
            user.setPreferredLanguage(lang);
            userRepository.save(user);
            log.info("Updated language preference for userId={} to {}", userId, lang);
        }
    }

    // ─── Get the currently logged-in user's profile ───
    public UserResponse getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();

        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .status(user.getStatus().name())
                .emailVerified(user.isEmailVerified())
                .preferredLanguage(user.getPreferredLanguage())
                .build();
    }

    // ─── Helper Methods ───

    public ResponseCookie createRefreshCookie(String rawRefreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE_NAME, rawRefreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(refreshTtlDays))
                .build();
    }

    public void clearRefreshCookie(HttpServletResponse response) {
        if (response != null) {
            ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE_NAME, "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/api/auth")
                    .sameSite("Lax")
                    .maxAge(0)
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String extractCookie(HttpServletRequest request, String name) {
        if (request == null || request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (name.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void validateOriginOrReferer(HttpServletRequest request) {
        String originHeader = request.getHeader("Origin");
        String refererHeader = request.getHeader("Referer");

        String targetUrl = (originHeader != null && !originHeader.isBlank())
                ? originHeader
                : refererHeader;

        if (targetUrl == null || targetUrl.isBlank()) {
            // In same-origin browser calls, Origin or Referer is sent with POST/PUT
            return;
        }

        try {
            URI uri = URI.create(targetUrl);
            String host = uri.getHost();
            if (host == null) return;

            // Allow local server host
            String serverName = request.getServerName();
            if (host.equalsIgnoreCase(serverName) || "localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host)) {
                return;
            }

            // Check against allowed origins list
            if (allowedOrigins != null && !allowedOrigins.isBlank()) {
                String[] origins = allowedOrigins.split(",");
                for (String allowed : origins) {
                    try {
                        URI allowedUri = URI.create(allowed.trim());
                        if (host.equalsIgnoreCase(allowedUri.getHost())) {
                            return;
                        }
                    } catch (Exception ignored) {}
                }
            }

            log.warn("Origin/Referer host not allowed: host={}, serverName={}", host, serverName);
            throw new BadCredentialsException("Origin not allowed");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to parse Origin/Referer: {}", targetUrl);
        }
    }

    private String truncate(String val, int max) {
        if (val == null) return null;
        return val.length() <= max ? val : val.substring(0, max);
    }
}
