package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Farmer profile registration and update request")
public class FarmerProfileRequest {

    @Schema(description = "Farm or business name", example = "Green Valley Farms")
    @NotBlank(message = "Farm name is required")
    @Size(max = 100, message = "Farm name cannot exceed 100 characters")
    private String farmName;

    @Schema(description = "Village name", example = "Songir")
    @NotBlank(message = "Village is required")
    @Size(max = 100, message = "Village cannot exceed 100 characters")
    private String village;

    @Schema(description = "District name", example = "Dhule")
    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District cannot exceed 100 characters")
    private String district;

    @Schema(description = "State name", example = "Maharashtra")
    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Schema(description = "6-digit postal pincode", example = "424001")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @Schema(description = "Farm GPS latitude", example = "20.9042")
    @Min(-90)
    @Max(90)
    private Double latitude;

    @Schema(description = "Farm GPS longitude", example = "74.7749")
    @Min(-180)
    @Max(180)
    private Double longitude;
}
