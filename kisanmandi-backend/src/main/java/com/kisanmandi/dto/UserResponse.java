package com.kisanmandi.dto;

import lombok.*;

// DTO for returning user profile info — NEVER includes the password
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String status;
}
