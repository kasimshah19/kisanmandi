package com.kisanmandi.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// JPA entity mapped to the "users" table in MySQL
@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // Password is stored as a BCrypt hash; never expose in API responses
    @Column(nullable = false)
    private String password;

    private String phone;

    // Store role as a string in DB (e.g., "FARMER", "CUSTOMER", "ADMIN")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Account status (ACTIVE by default, admin can BLOCK a user)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    // Automatically set when a new user is saved for the first time
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
