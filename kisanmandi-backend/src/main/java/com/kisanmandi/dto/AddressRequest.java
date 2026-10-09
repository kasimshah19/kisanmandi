package com.kisanmandi.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AddressRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100, message = "Full name must be less than 100 characters")
    private String fullName;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
    private String phone;

    @NotBlank(message = "Address line 1 is required")
    @Size(max = 255, message = "Address line 1 must be less than 255 characters")
    private String line1;

    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City must be less than 100 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(max = 100, message = "State must be less than 100 characters")
    private String state;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @jakarta.validation.constraints.DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @jakarta.validation.constraints.DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @jakarta.validation.constraints.DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @jakarta.validation.constraints.DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private boolean defaultAddress;
}
