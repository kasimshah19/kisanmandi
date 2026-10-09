package com.kisanmandi.controller;

import com.kisanmandi.dto.CartAddRequest;
import com.kisanmandi.dto.CartResponse;
import com.kisanmandi.dto.CartUpdateRequest;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        return ResponseEntity.ok(cartService.getCart(authService.getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<Void> addToCart(
            @Valid @RequestBody CartAddRequest request) {
        cartService.addToCart(authService.getCurrentUser().getId(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<Void> updateQuantity(
            @PathVariable Long itemId,
            @Valid @RequestBody CartUpdateRequest request) {
        cartService.updateQuantity(authService.getCurrentUser().getId(), itemId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeItem(
            @PathVariable Long itemId) {
        cartService.removeItem(authService.getCurrentUser().getId(), itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart() {
        cartService.clearCart(authService.getCurrentUser().getId());
        return ResponseEntity.noContent().build();
    }
}
