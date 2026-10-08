package com.kisanmandi.repository;

import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Spring Data JPA repository — auto-generates SQL queries from method names
public interface UserRepository extends JpaRepository<User, Long> {

    // Find a user by their email (used for login and loading user details)
    Optional<User> findByEmail(String email);

    // Check if an email is already registered (used during registration)
    boolean existsByEmail(String email);

    // Check if any user with ADMIN role exists (used by DataSeeder)
    boolean existsByRole(Role role);
}
