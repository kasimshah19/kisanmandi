package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

// DTO for login — both fields are required
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Schema(description = "User login credentials")
public class LoginRequest {

    @Schema(description = "Registered email address", example = "ramesh@example.com")
    @NotBlank(message = "Email is required")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Schema(description = "Account password", example = "securePassword123")
    @NotBlank(message = "Password is required")
    @Size(max = 100, message = "Password cannot exceed 100 characters")
    private String password;
}
