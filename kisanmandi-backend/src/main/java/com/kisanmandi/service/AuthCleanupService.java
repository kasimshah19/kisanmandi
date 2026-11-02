package com.kisanmandi.service;

import com.kisanmandi.repository.LoginAttemptRepository;
import com.kisanmandi.repository.RefreshTokenRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthCleanupService {

    private static final Logger log = LoggerFactory.getLogger(AuthCleanupService.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;

    public AuthCleanupService(RefreshTokenRepository refreshTokenRepository,
                              LoginAttemptRepository loginAttemptRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginAttemptRepository = loginAttemptRepository;
    }

    @PostConstruct
    public void runStartupCleanup() {
        try {
            cleanupStaleRecords();
        } catch (Exception e) {
            log.warn("Auth startup cleanup encountered an error: {}", e.getMessage());
        }
    }

    @Scheduled(cron = "${app.auth.cleanup-cron:0 0 3 * * ?}")
    public void runPeriodicCleanup() {
        cleanupStaleRecords();
    }

    @Transactional
    public void cleanupStaleRecords() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tokenCutoff = now.minusDays(30);
        LocalDateTime attemptCutoff = now.minusDays(1);

        int deletedTokens = refreshTokenRepository.deleteExpiredOrRevokedBefore(tokenCutoff);
        int deletedAttempts = loginAttemptRepository.deleteStaleAttempts(attemptCutoff, now);

        if (deletedTokens > 0 || deletedAttempts > 0) {
            log.info("Auth cleanup finished: deleted {} expired/revoked refresh tokens (>30d) and {} stale login attempts (>1d)",
                    deletedTokens, deletedAttempts);
        }
    }
}

