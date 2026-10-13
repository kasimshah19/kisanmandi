package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body to reject an order or farmer approval")
public class RejectRequest {
    @Schema(description = "Rejection reason", example = "Crop stock depleted")
    @NotBlank(message = "Reason is required")
    @Size(max = 300, message = "Reason cannot exceed 300 characters")
    private String reason;
}
