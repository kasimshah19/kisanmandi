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

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private FarmerProfile profile;

    public String getFullName() {
        return this.name;
    }

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

    @Column(length = 300)
    private String blockedReason;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailVerified = false;

    @Column(nullable = false)
    @Builder.Default
    private int tokenVersion = 1;

    @Column(nullable = false)
    @Builder.Default
    private int failedLoginAttempts = 0;

    private LocalDateTime lockoutUntil;

    private LocalDateTime passwordChangedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<PasswordResetToken> passwordResetTokens = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<EmailVerificationToken> emailVerificationTokens = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<Notification> notifications = new java.util.ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private java.util.List<RefreshToken> refreshTokens = new java.util.ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
