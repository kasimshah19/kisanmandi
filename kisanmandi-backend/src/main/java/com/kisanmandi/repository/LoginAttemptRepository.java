package com.kisanmandi.repository;

import com.kisanmandi.entity.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {

    @Modifying
    @Transactional
    @Query("DELETE FROM LoginAttempt a WHERE a.lastFailedAt < :cutoff AND (a.lockedUntil IS NULL OR a.lockedUntil < :now)")
    int deleteStaleAttempts(@Param("cutoff") LocalDateTime cutoff, @Param("now") LocalDateTime now);
}

