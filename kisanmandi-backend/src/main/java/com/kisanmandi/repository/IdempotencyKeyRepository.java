package com.kisanmandi.repository;

import com.kisanmandi.entity.IdempotencyKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface IdempotencyKeyRepository extends JpaRepository<IdempotencyKey, Long> {

    Optional<IdempotencyKey> findByUserIdAndIdemKey(Long userId, String idemKey);

    @Modifying
    @Query("DELETE FROM IdempotencyKey k WHERE k.createdAt < :threshold")
    int deleteOlderThan(@Param("threshold") LocalDateTime threshold);
}

