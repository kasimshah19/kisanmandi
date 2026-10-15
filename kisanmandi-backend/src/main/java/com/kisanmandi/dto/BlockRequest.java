package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
@Schema(description = "Request body to block or unblock a user")
public class BlockRequest {
    @Schema(description = "Reason for block/unblock", example = "Violated marketplace terms of service")
    @Size(max = 300, message = "Reason cannot exceed 300 characters")
    private String reason;
}
