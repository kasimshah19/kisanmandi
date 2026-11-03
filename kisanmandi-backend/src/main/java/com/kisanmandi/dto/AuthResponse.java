package com.kisanmandi.dto;

import lombok.*;

// DTO returned after successful login or token refresh — includes JWT token, expiresIn, and user info
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long expiresIn;
    private Long id;
    private String name;
    private String email;
    private String role;
    private boolean emailVerified;
    private String preferredLanguage;
}
