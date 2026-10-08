package com.kisanmandi.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductStatusRequest {
    @NotNull(message = "Active status is required")
    private Boolean active;
}
