package com.kisanmandi.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class FarmerProfileRequest {
    @NotBlank(message = "Farm name is required")
    private String farmName;

    @NotBlank(message = "Village is required")
    private String village;

    @NotBlank(message = "District is required")
    private String district;

    @NotBlank(message = "State is required")
    private String state;

    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @Min(-90)
    @Max(90)
    private Double latitude;

    @Min(-180)
    @Max(180)
    private Double longitude;
}
