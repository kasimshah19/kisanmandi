package com.kisanmandi.dto;

import lombok.*;

// DTO returned after successful login — includes JWT token and user info
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private String role;
}
