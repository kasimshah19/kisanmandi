package com.kisanmandi.dto;

import com.kisanmandi.entity.Role;
import jakarta.validation.constraints.*;
import lombok.*;

// DTO for user registration — validates input before processing
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @NotNull(message = "Role is required (FARMER or CUSTOMER)")
    private Role role;
}
