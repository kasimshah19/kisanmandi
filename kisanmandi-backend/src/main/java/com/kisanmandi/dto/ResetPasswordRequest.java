package com.kisanmandi.dto;

import com.kisanmandi.security.StrongPassword;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Reset password payload with token and new password")
public class ResetPasswordRequest {

    @Schema(description = "Raw password reset token received via link", example = "a1b2c3d4e5f6...")
    @NotBlank(message = "Token is required")
    private String token;

    @Schema(description = "New password (min 8 chars, letter and digit)", example = "NewPass@123")
    @NotBlank(message = "New password is required")
    @StrongPassword
    private String newPassword;
}
