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
@Schema(description = "Change password payload for logged-in users")
public class ChangePasswordRequest {

    @Schema(description = "Current active password", example = "OldPass@123")
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @Schema(description = "New password (min 8 chars, letter and digit)", example = "NewPass@123")
    @NotBlank(message = "New password is required")
    @StrongPassword
    private String newPassword;
}
