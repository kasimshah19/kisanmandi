package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Password reset request payload")
public class ForgotPasswordRequest {

    @Schema(description = "Registered email address", example = "farmer@demo.com")
    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String email;
}
