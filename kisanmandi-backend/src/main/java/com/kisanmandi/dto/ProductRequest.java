package com.kisanmandi.dto;

import com.kisanmandi.entity.ProductUnit;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Product creation or update payload")
public class ProductRequest {

    @Schema(description = "Product name", example = "Organic Wheat")
    @NotBlank(message = "Product name is required")
    @Size(max = 100, message = "Product name cannot exceed 100 characters")
    private String name;

    @Schema(description = "Detailed product description", example = "Freshly harvested Sharbati wheat, direct from Dhule farm")
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Schema(description = "Category ID", example = "1")
    @NotNull(message = "Category is required")
    private Long categoryId;

    @Schema(description = "Price per unit in INR", example = "45.00")
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal pricePerUnit;

    @Schema(description = "Measurement unit", example = "KG")
    @NotNull(message = "Unit is required")
    private ProductUnit unit;

    @Schema(description = "Available quantity for sale", example = "500.00")
    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", message = "Quantity cannot be negative")
    private BigDecimal quantityAvailable;
}
