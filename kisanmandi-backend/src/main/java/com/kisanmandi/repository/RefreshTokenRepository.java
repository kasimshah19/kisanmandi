package com.kisanmandi.repository;

import com.kisanmandi.entity.RefreshToken;
import com.kisanmandi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    List<RefreshToken> findByFamilyId(String familyId);

    List<RefreshToken> findByUser(User user);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.familyId = :familyId AND r.revokedAt IS NULL")
    int revokeFamily(@Param("familyId") String familyId, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("UPDATE RefreshToken r SET r.revokedAt = :now WHERE r.user.id = :userId AND r.revokedAt IS NULL")
    int revokeAllByUser(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshToken r WHERE r.expiresAt < :cutoff OR (r.revokedAt IS NOT NULL AND r.revokedAt < :cutoff)")
    int deleteExpiredOrRevokedBefore(@Param("cutoff") LocalDateTime cutoff);

    void deleteByUser(User user);
}

