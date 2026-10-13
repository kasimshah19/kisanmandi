package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body to hide a product from public view")
public class HideRequest {
    @Schema(description = "Reason for hiding product", example = "Quality verification pending")
    @Size(max = 300, message = "Reason cannot exceed 300 characters")
    private String reason;
}
