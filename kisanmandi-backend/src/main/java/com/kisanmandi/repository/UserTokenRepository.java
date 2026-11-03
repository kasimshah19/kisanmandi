package com.kisanmandi.repository;

import com.kisanmandi.entity.User;
import com.kisanmandi.entity.UserToken;
import com.kisanmandi.entity.UserTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserTokenRepository extends JpaRepository<UserToken, Long> {

    Optional<UserToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("UPDATE UserToken ut SET ut.usedAt = :now WHERE ut.tokenHash = :tokenHash AND ut.type = :type AND ut.usedAt IS NULL AND ut.expiresAt > :now")
    int markUsedAtomic(@Param("tokenHash") String tokenHash, @Param("type") UserTokenType type, @Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE UserToken ut SET ut.usedAt = :now WHERE ut.user.id = :userId AND ut.type = :type AND ut.usedAt IS NULL")
    int invalidateExistingTokens(@Param("userId") Long userId, @Param("type") UserTokenType type, @Param("now") LocalDateTime now);

    Optional<UserToken> findTopByUserIdAndTypeOrderByCreatedAtDesc(Long userId, UserTokenType type);

    int countByUserIdAndTypeAndCreatedAtAfter(Long userId, UserTokenType type, LocalDateTime after);

    void deleteByUser(User user);
}

