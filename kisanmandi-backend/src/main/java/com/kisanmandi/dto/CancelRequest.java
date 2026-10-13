package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Order cancellation request")
public class CancelRequest {
    @Schema(description = "Reason for cancellation", example = "Ordered incorrect quantity")
    @Size(max = 300, message = "Reason cannot exceed 300 characters")
    private String reason;
}
