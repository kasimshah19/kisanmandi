package com.kisanmandi.service;

import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserToken;
import com.kisanmandi.entity.UserTokenType;
import com.kisanmandi.repository.UserTokenRepository;
import com.kisanmandi.security.TokenHashUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserTokenServiceTest {

    @Mock
    private UserTokenRepository userTokenRepository;

    private UserTokenService userTokenService;
    private User testUser;

    @BeforeEach
    void setUp() {
        userTokenService = new UserTokenService(userTokenRepository);
        testUser = User.builder()
                .id(1L)
                .name("Ramesh")
                .email("ramesh@example.com")
                .role(Role.FARMER)
                .emailVerified(false)
                .build();
    }

    @Test
    @DisplayName("createToken generates random base64url token and invalidates older unused tokens")
    void testCreateToken() {
        String rawToken = userTokenService.createToken(testUser, UserTokenType.VERIFY_EMAIL);

        assertNotNull(rawToken);
        assertTrue(rawToken.length() >= 32);

        // Verify invalidation called
        verify(userTokenRepository).invalidateExistingTokens(eq(1L), eq(UserTokenType.VERIFY_EMAIL), any(LocalDateTime.class));

        // Verify token saved with correct SHA-256 hash
        ArgumentCaptor<UserToken> captor = ArgumentCaptor.forClass(UserToken.class);
        verify(userTokenRepository).save(captor.capture());
        UserToken saved = captor.getValue();
        assertEquals(TokenHashUtil.hashToken(rawToken), saved.getTokenHash());
        assertEquals(UserTokenType.VERIFY_EMAIL, saved.getType());
        assertTrue(saved.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    @Test
    @DisplayName("consumeToken atomically updates token and returns user on success")
    void testConsumeTokenSuccess() {
        String rawToken = "sampleRawTokenForTesting12345678";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        when(userTokenRepository.markUsedAtomic(eq(tokenHash), eq(UserTokenType.VERIFY_EMAIL), any(LocalDateTime.class)))
                .thenReturn(1);

        UserToken token = UserToken.builder()
                .user(testUser)
                .type(UserTokenType.VERIFY_EMAIL)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .usedAt(LocalDateTime.now())
                .build();

        when(userTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));

        User result = userTokenService.consumeToken(rawToken, UserTokenType.VERIFY_EMAIL);
        assertNotNull(result);
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    @Test
    @DisplayName("consumeToken throws when token is already used")
    void testConsumeTokenAlreadyUsed() {
        String rawToken = "alreadyUsedToken123456789012345";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        when(userTokenRepository.markUsedAtomic(eq(tokenHash), eq(UserTokenType.RESET_PASSWORD), any(LocalDateTime.class)))
                .thenReturn(0);

        UserToken usedToken = UserToken.builder()
                .user(testUser)
                .type(UserTokenType.RESET_PASSWORD)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .usedAt(LocalDateTime.now().minusMinutes(1))
                .build();

        when(userTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(usedToken));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                userTokenService.consumeToken(rawToken, UserTokenType.RESET_PASSWORD)
        );
        assertTrue(ex.getMessage().contains("already been used"));
    }

    @Test
    @DisplayName("consumeToken succeeds idempotently for verify email if user already verified")
    void testConsumeTokenIdempotentForVerifiedUser() {
        String rawToken = "verifiedToken123456789012345678";
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        testUser.setEmailVerified(true);

        when(userTokenRepository.markUsedAtomic(eq(tokenHash), eq(UserTokenType.VERIFY_EMAIL), any(LocalDateTime.class)))
                .thenReturn(0);

        UserToken token = UserToken.builder()
                .user(testUser)
                .type(UserTokenType.VERIFY_EMAIL)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .usedAt(LocalDateTime.now().minusMinutes(5))
                .build();

        when(userTokenRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(token));

        User result = userTokenService.consumeToken(rawToken, UserTokenType.VERIFY_EMAIL);
        assertNotNull(result);
        assertTrue(result.isEmailVerified());
    }
}

