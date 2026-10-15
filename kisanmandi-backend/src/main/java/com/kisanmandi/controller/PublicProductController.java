package com.kisanmandi.controller;

import com.kisanmandi.dto.PageResponse;
import com.kisanmandi.dto.ProductResponse;
import com.kisanmandi.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Public Products", description = "Public catalog for browsing and searching farm products")
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class PublicProductController {

    private final ProductService productService;

    @Operation(summary = "Search and filter published farm products")
    @GetMapping
    public ResponseEntity<PageResponse<ProductResponse>> searchProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long farmerId,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
            @RequestParam(required = false) Double radius,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productService.searchPublicProducts(categoryId, farmerId, q, district, pincode, sort, latitude, longitude, radius, page, size));
    }

    @Operation(summary = "Get single published product details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getPublicProduct(id));
    }
}
