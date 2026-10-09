package com.kisanmandi.controller;

import com.kisanmandi.dto.AddressRequest;
import com.kisanmandi.dto.AddressResponse;
import com.kisanmandi.service.AuthService;
import com.kisanmandi.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer/addresses")
@RequiredArgsConstructor
public class CustomerAddressController {

    private final AddressService addressService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<AddressResponse>> getAddresses() {
        return ResponseEntity.ok(addressService.getCustomerAddresses(authService.getCurrentUser().getId()));
    }

    @PostMapping
    public ResponseEntity<AddressResponse> createAddress(
            @Valid @RequestBody AddressRequest request) {
        return new ResponseEntity<>(addressService.createAddress(authService.getCurrentUser().getId(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        return ResponseEntity.ok(addressService.updateAddress(authService.getCurrentUser().getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @PathVariable Long id) {
        addressService.deleteAddress(authService.getCurrentUser().getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<Void> setDefaultAddress(
            @PathVariable Long id) {
        addressService.setDefaultAddress(authService.getCurrentUser().getId(), id);
        return ResponseEntity.ok().build();
    }
}
