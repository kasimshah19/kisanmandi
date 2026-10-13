package com.kisanmandi.controller;

import com.kisanmandi.dto.CategoryRequest;
import com.kisanmandi.dto.CategoryResponse;
import com.kisanmandi.dto.ProductStatusRequest;
import com.kisanmandi.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Admin Categories", description = "Admin commodity category administration")
@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "List all categories (both active and inactive)")
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @Operation(summary = "Create a new product category")
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request) {
        return new ResponseEntity<>(categoryService.createCategory(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing category name")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @Operation(summary = "Enable or disable a product category")
    @PatchMapping("/{id}/status")
    public ResponseEntity<CategoryResponse> setCategoryStatus(@PathVariable Long id, @Valid @RequestBody ProductStatusRequest request) {
        return ResponseEntity.ok(categoryService.setCategoryStatus(id, request.getActive()));
    }
}
