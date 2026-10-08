package com.kisanmandi.dto;

import jakarta.validation.constraints.*;
import lombok.*;

// DTO for login — both fields are required
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class LoginRequest {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
