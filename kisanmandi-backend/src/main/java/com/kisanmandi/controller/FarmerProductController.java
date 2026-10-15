package com.kisanmandi.controller;

import com.kisanmandi.dto.ProductRequest;
import com.kisanmandi.dto.ProductResponse;
import com.kisanmandi.dto.ProductStatusRequest;
import com.kisanmandi.dto.StockUpdateRequest;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Farmer Products", description = "Product catalog management for farmers")
@RestController
@RequestMapping("/api/farmer/products")
@RequiredArgsConstructor
public class FarmerProductController {

    private final ProductService productService;
    private final AuthService authService;

    @Operation(summary = "Get all products listed by the logged-in farmer")
    @GetMapping
    public ResponseEntity<List<ProductResponse>> getMyProducts() {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(productService.getMyProducts(farmerId));
    }

    @Operation(summary = "Get a single product listed by the logged-in farmer (even if inactive)")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getMyProduct(@PathVariable Long id) {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(productService.getMyProduct(farmerId, id));
    }

    @Operation(summary = "Create a new product listing with optional image")
    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Long farmerId = authService.getCurrentUser().getId();
        ProductResponse response = productService.createProduct(farmerId, request, image);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @Operation(summary = "Update an existing product listing")
    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @ModelAttribute ProductRequest request,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(productService.updateProduct(farmerId, id, request, image));
    }

    @Operation(summary = "Update product stock quantity")
    @PatchMapping("/{id}/stock")
    public ResponseEntity<ProductResponse> updateStock(
            @PathVariable Long id,
            @Valid @RequestBody StockUpdateRequest request) {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(productService.updateStock(farmerId, id, request));
    }

    @Operation(summary = "Enable or disable product visibility")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ProductResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProductStatusRequest request) {
        Long farmerId = authService.getCurrentUser().getId();
        return ResponseEntity.ok(productService.updateStatus(farmerId, id, request));
    }

    @Operation(summary = "Soft-delete a product listing")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> softDelete(@PathVariable Long id) {
        Long farmerId = authService.getCurrentUser().getId();
        productService.softDelete(farmerId, id);
        return ResponseEntity.noContent().build();
    }
}
