package com.kisanmandi.dto;

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
@Schema(description = "Verify email payload with token")
public class VerifyEmailRequest {

    @Schema(description = "Raw email verification token received via link", example = "a1b2c3d4e5f6...")
    @NotBlank(message = "Token is required")
    private String token;
}
