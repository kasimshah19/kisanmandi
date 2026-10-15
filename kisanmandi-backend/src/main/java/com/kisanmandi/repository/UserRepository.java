package com.kisanmandi.repository;

import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Spring Data JPA repository — auto-generates SQL queries from method names
public interface UserRepository extends JpaRepository<User, Long> {

    @Override
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"profile"})
    @org.springframework.lang.NonNull
    org.springframework.data.domain.Page<User> findAll(@org.springframework.lang.NonNull org.springframework.data.domain.Pageable pageable);

    // Find a user by their email (used for login and loading user details)
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"profile"})
    Optional<User> findByEmail(String email);

    // Check if an email is already registered (used during registration)
    boolean existsByEmail(String email);

    // Check if any user with ADMIN role exists (used by DataSeeder)
    boolean existsByRole(Role role);

    long countByRole(Role role);

    long countByStatus(com.kisanmandi.entity.UserStatus status);

    long countByCreatedAtAfter(java.time.LocalDateTime after);
}
