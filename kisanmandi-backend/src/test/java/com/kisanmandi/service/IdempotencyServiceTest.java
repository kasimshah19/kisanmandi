package com.kisanmandi.service;

import com.kisanmandi.entity.IdempotencyKey;
import com.kisanmandi.entity.IdempotencyStatus;
import com.kisanmandi.exception.ConflictException;
import com.kisanmandi.exception.UnprocessableEntityException;
import com.kisanmandi.repository.IdempotencyKeyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private IdempotencyKeyRepository repository;

    @InjectMocks
    private IdempotencyService service;

    private static final Long USER_ID = 42L;
    private static final String IDEM_KEY = "idem-uuid-999";
    private static final String FINGERPRINT = "sha256_mock_fingerprint_abc";

    @Test
    @DisplayName("First checkout request inserts IN_PROGRESS and proceeds")
    void testFirstRequestProceeds() {
        when(repository.findByUserIdAndIdemKey(USER_ID, IDEM_KEY)).thenReturn(Optional.empty());

        IdempotencyService.CheckResult result = service.checkAndLock(USER_ID, IDEM_KEY, FINGERPRINT);

        assertFalse(result.isReplay());
        verify(repository).saveAndFlush(any(IdempotencyKey.class));
    }

    @Test
    @DisplayName("Duplicate request with same key and same fingerprint replays stored response")
    void testCompletedRequestReplays() {
        IdempotencyKey completed = IdempotencyKey.builder()
                .userId(USER_ID)
                .idemKey(IDEM_KEY)
                .fingerprint(FINGERPRINT)
                .status(IdempotencyStatus.COMPLETED)
                .responseStatus(201)
                .responseBody("{\"orders\":[{\"id\":100}]}")
                .build();

        when(repository.findByUserIdAndIdemKey(USER_ID, IDEM_KEY)).thenReturn(Optional.of(completed));

        IdempotencyService.CheckResult result = service.checkAndLock(USER_ID, IDEM_KEY, FINGERPRINT);

        assertTrue(result.isReplay());
        assertEquals(201, result.getResponseStatus());
        assertEquals("{\"orders\":[{\"id\":100}]}", result.getResponseBody());
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Same key with different payload throws UnprocessableEntityException (422)")
    void testDifferentPayloadThrows422() {
        IdempotencyKey existing = IdempotencyKey.builder()
                .userId(USER_ID)
                .idemKey(IDEM_KEY)
                .fingerprint("original_fingerprint_123")
                .status(IdempotencyStatus.COMPLETED)
                .build();

        when(repository.findByUserIdAndIdemKey(USER_ID, IDEM_KEY)).thenReturn(Optional.of(existing));

        assertThrows(UnprocessableEntityException.class, () ->
                service.checkAndLock(USER_ID, IDEM_KEY, "different_fingerprint_456"));
    }

    @Test
    @DisplayName("Concurrent in-progress request within 2 minutes throws ConflictException (409)")
    void testInProgressRequestThrows409() {
        IdempotencyKey inProgress = IdempotencyKey.builder()
                .userId(USER_ID)
                .idemKey(IDEM_KEY)
                .fingerprint(FINGERPRINT)
                .status(IdempotencyStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now().minusSeconds(30)) // 30 seconds ago
                .build();

        when(repository.findByUserIdAndIdemKey(USER_ID, IDEM_KEY)).thenReturn(Optional.of(inProgress));

        assertThrows(ConflictException.class, () ->
                service.checkAndLock(USER_ID, IDEM_KEY, FINGERPRINT));
    }

    @Test
    @DisplayName("Expired in-progress request (> 2 minutes) resets and allows retry")
    void testExpiredInProgressAllowsRetry() {
        IdempotencyKey timedOut = IdempotencyKey.builder()
                .userId(USER_ID)
                .idemKey(IDEM_KEY)
                .fingerprint(FINGERPRINT)
                .status(IdempotencyStatus.IN_PROGRESS)
                .createdAt(LocalDateTime.now().minusMinutes(3)) // 3 minutes ago
                .build();

        when(repository.findByUserIdAndIdemKey(USER_ID, IDEM_KEY)).thenReturn(Optional.of(timedOut));

        IdempotencyService.CheckResult result = service.checkAndLock(USER_ID, IDEM_KEY, FINGERPRINT);

        assertFalse(result.isReplay());
        verify(repository).save(timedOut);
    }
}

