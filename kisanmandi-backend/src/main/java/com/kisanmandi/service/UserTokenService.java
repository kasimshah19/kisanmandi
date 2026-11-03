package com.kisanmandi.service;

import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserToken;
import com.kisanmandi.entity.UserTokenType;
import com.kisanmandi.repository.UserTokenRepository;
import com.kisanmandi.security.TokenHashUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
public class UserTokenService {

    private final UserTokenRepository userTokenRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public UserTokenService(UserTokenRepository userTokenRepository) {
        this.userTokenRepository = userTokenRepository;
    }

    @Transactional
    public String createToken(User user, UserTokenType type) {
        LocalDateTime now = LocalDateTime.now();

        // Invalidate older unused tokens of the same type for this user
        userTokenRepository.invalidateExistingTokens(user.getId(), type, now);

        String rawToken = generateOpaqueToken();
        String tokenHash = TokenHashUtil.hashToken(rawToken);

        LocalDateTime expiresAt = (type == UserTokenType.VERIFY_EMAIL)
                ? now.plusHours(24)
                : now.plusMinutes(30);

        UserToken userToken = UserToken.builder()
                .user(user)
                .type(type)
                .tokenHash(tokenHash)
                .expiresAt(expiresAt)
                .usedAt(null)
                .createdAt(now)
                .build();

        userTokenRepository.save(userToken);
        return rawToken;
    }

    @Transactional
    public User consumeToken(String rawToken, UserTokenType expectedType) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Token is required");
        }

        String tokenHash = TokenHashUtil.hashToken(rawToken.trim());
        LocalDateTime now = LocalDateTime.now();

        int updated = userTokenRepository.markUsedAtomic(tokenHash, expectedType, now);
        if (updated == 0) {
            // Check state for descriptive error or idempotent handling
            Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHash(tokenHash);
            if (tokenOpt.isEmpty()) {
                throw new IllegalArgumentException(expectedType == UserTokenType.RESET_PASSWORD
                        ? "Invalid or expired password reset link"
                        : "Invalid or expired link");
            }

            UserToken token = tokenOpt.get();
            if (token.getType() != expectedType) {
                throw new IllegalArgumentException(expectedType == UserTokenType.RESET_PASSWORD
                        ? "Invalid or expired password reset link"
                        : "Invalid link");
            }

            // Idempotent email verification: if user is already verified, succeed gracefully
            if (expectedType == UserTokenType.VERIFY_EMAIL && token.getUser().isEmailVerified()) {
                return token.getUser();
            }

            if (token.isUsed()) {
                throw new IllegalArgumentException("This link has already been used");
            }

            if (token.isExpired()) {
                throw new IllegalArgumentException(expectedType == UserTokenType.RESET_PASSWORD
                        ? "Invalid or expired password reset link"
                        : "This link has expired");
            }

            throw new IllegalArgumentException(expectedType == UserTokenType.RESET_PASSWORD
                    ? "Invalid or expired password reset link"
                    : "Invalid or expired link");
        }

        return userTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Token not found"))
                .getUser();
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

