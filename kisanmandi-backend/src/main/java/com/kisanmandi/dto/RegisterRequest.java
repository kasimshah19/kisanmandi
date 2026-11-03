package com.kisanmandi.dto;

import com.kisanmandi.entity.Role;
import com.kisanmandi.security.StrongPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

// DTO for user registration — validates input before processing
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Schema(description = "User registration payload")
@StrongPassword
public class RegisterRequest {

    @Schema(description = "Full name of the user", example = "Ramesh Kumar")
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Schema(description = "Unique email address", example = "ramesh@example.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;

    @Schema(description = "Password (minimum 8 characters, letter and digit)", example = "securePassword123")
    @NotBlank(message = "Password is required")
    private String password;

    @Schema(description = "10-digit mobile number", example = "9876543210")
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @Schema(description = "User role (FARMER or CUSTOMER)", example = "FARMER")
    @NotNull(message = "Role is required (FARMER or CUSTOMER)")
    private Role role;

    @Schema(description = "Preferred language (en, hi, mr)", example = "en")
    private String language;

    public RegisterRequest(String name, String email, String password, String phone, Role role) {
        this(name, email, password, phone, role, "en");
    }
}
