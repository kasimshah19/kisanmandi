package com.kisanmandi.service;

import com.kisanmandi.entity.IdempotencyKey;
import com.kisanmandi.entity.IdempotencyStatus;
import com.kisanmandi.exception.ConflictException;
import com.kisanmandi.exception.UnprocessableEntityException;
import com.kisanmandi.repository.IdempotencyKeyRepository;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final IdempotencyKeyRepository repository;

    @Getter
    public static class CheckResult {
        private final boolean replay;
        private final Integer responseStatus;
        private final String responseBody;

        private CheckResult(boolean replay, Integer responseStatus, String responseBody) {
            this.replay = replay;
            this.responseStatus = responseStatus;
            this.responseBody = responseBody;
        }

        public static CheckResult proceed() {
            return new CheckResult(false, null, null);
        }

        public static CheckResult replay(Integer status, String body) {
            return new CheckResult(true, status, body);
        }
    }

    public String computeFingerprint(Long userId, String httpMethod, String path, String rawBody) {
        try {
            String input = (userId != null ? userId : "") + ":" + httpMethod + ":" + path + ":" + (rawBody != null ? rawBody : "");
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CheckResult checkAndLock(Long userId, String idemKey, String fingerprint) {
        if (idemKey == null || idemKey.isBlank()) {
            return CheckResult.proceed();
        }

        Optional<IdempotencyKey> existingOpt = repository.findByUserIdAndIdemKey(userId, idemKey);
        if (existingOpt.isPresent()) {
            IdempotencyKey existing = existingOpt.get();
            if (!existing.getFingerprint().equals(fingerprint)) {
                throw new UnprocessableEntityException("Idempotency key re-used with different request payload");
            }
            if (existing.getStatus() == IdempotencyStatus.COMPLETED) {
                return CheckResult.replay(existing.getResponseStatus(), existing.getResponseBody());
            }
            // IN_PROGRESS check
            if (existing.getCreatedAt() != null && existing.getCreatedAt().plusMinutes(2).isAfter(LocalDateTime.now())) {
                throw new ConflictException("Checkout request already in progress with this idempotency key");
            }
            // Expired in-progress attempt (> 2 minutes), reset to new in-progress
            existing.setFingerprint(fingerprint);
            existing.setCreatedAt(LocalDateTime.now());
            existing.setStatus(IdempotencyStatus.IN_PROGRESS);
            repository.save(existing);
            return CheckResult.proceed();
        }

        try {
            IdempotencyKey key = IdempotencyKey.builder()
                    .userId(userId)
                    .idemKey(idemKey)
                    .fingerprint(fingerprint)
                    .status(IdempotencyStatus.IN_PROGRESS)
                    .createdAt(LocalDateTime.now())
                    .build();
            repository.saveAndFlush(key);
            return CheckResult.proceed();
        } catch (DataIntegrityViolationException ex) {
            IdempotencyKey key = repository.findByUserIdAndIdemKey(userId, idemKey)
                    .orElseThrow(() -> new ConflictException("Checkout request already in progress with this idempotency key"));
            if (!key.getFingerprint().equals(fingerprint)) {
                throw new UnprocessableEntityException("Idempotency key re-used with different request payload");
            }
            if (key.getStatus() == IdempotencyStatus.COMPLETED) {
                return CheckResult.replay(key.getResponseStatus(), key.getResponseBody());
            }
            throw new ConflictException("Checkout request already in progress with this idempotency key");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void complete(Long userId, String idemKey, int responseStatus, String responseBody) {
        if (idemKey == null || idemKey.isBlank()) return;
        repository.findByUserIdAndIdemKey(userId, idemKey).ifPresent(key -> {
            key.setStatus(IdempotencyStatus.COMPLETED);
            key.setResponseStatus(responseStatus);
            key.setResponseBody(responseBody);
            key.setCompletedAt(LocalDateTime.now());
            repository.save(key);
        });
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void fail(Long userId, String idemKey) {
        if (idemKey == null || idemKey.isBlank()) return;
        repository.findByUserIdAndIdemKey(userId, idemKey).ifPresent(key -> {
            if (key.getStatus() == IdempotencyStatus.IN_PROGRESS) {
                repository.delete(key);
            }
        });
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void cleanupExpiredKeys() {
        LocalDateTime threshold = LocalDateTime.now().minusHours(24);
        int deleted = repository.deleteOlderThan(threshold);
        if (deleted > 0) {
            log.info("Cleaned up {} expired idempotency keys older than {}", deleted, threshold);
        }
    }
}

