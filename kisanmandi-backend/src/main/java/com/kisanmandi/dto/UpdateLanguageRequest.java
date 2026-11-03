package com.kisanmandi.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User preferred language update payload")
public class UpdateLanguageRequest {

    @Schema(description = "Language code: en, hi, or mr", example = "hi")
    @NotBlank(message = "Language is required")
    @Pattern(regexp = "^(en|hi|mr)$", message = "Language must be en, hi, or mr")
    private String language;
}

