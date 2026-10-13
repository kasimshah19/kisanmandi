package com.kisanmandi.controller;

import com.kisanmandi.dto.CartAddRequest;
import com.kisanmandi.dto.CartResponse;
import com.kisanmandi.dto.CartUpdateRequest;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Customer Cart", description = "Shopping cart operations for customers")
@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @Operation(summary = "Get current customer's shopping cart")
    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart(authService.getCurrentUser().getId()));
    }

    @Operation(summary = "Add an available product to shopping cart")
    @PostMapping
    public ResponseEntity<Void> addToCart(@Valid @RequestBody CartAddRequest request) {
        cartService.addToCart(authService.getCurrentUser().getId(), request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Update quantity of an item in cart")
    @PutMapping("/{itemId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody CartUpdateRequest request) {
        cartService.updateQuantity(authService.getCurrentUser().getId(), itemId, request);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Remove an item from cart")
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(authService.getCurrentUser().getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Clear all items from customer cart")
    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(authService.getCurrentUser().getId());
        return ResponseEntity.noContent().build();
    }
}
