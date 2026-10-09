package com.kisanmandi.service;

import com.kisanmandi.dto.CartAddRequest;
import com.kisanmandi.dto.CartItemResponse;
import com.kisanmandi.dto.CartResponse;
import com.kisanmandi.dto.CartUpdateRequest;
import com.kisanmandi.entity.CartItem;
import com.kisanmandi.entity.Product;
import com.kisanmandi.entity.ProductUnit;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.ProductUnavailableException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.CartItemRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CartResponse getCart(Long customerId) {
        List<CartItem> items = cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);

        BigDecimal total = BigDecimal.ZERO;
        List<CartItemResponse> responseItems = new java.util.ArrayList<>();

        for (CartItem item : items) {
            Product p = item.getProduct();
            
            // Check if product is still available for purchase
            boolean available = true;
            String reason = null;

            if (!p.isPubliclyVisible()) {
                available = false;
                reason = "Product is no longer available";
            } else if (p.getQuantityAvailable().compareTo(item.getQuantity()) < 0) {
                available = false;
                reason = "Not enough stock available";
            }

            BigDecimal price = p.getPricePerUnit();
            BigDecimal lineTotal = price.multiply(item.getQuantity()).setScale(2, RoundingMode.HALF_UP);
            
            if (available) {
                total = total.add(lineTotal);
            }

            responseItems.add(CartItemResponse.builder()
                    .id(item.getId())
                    .productId(p.getId())
                    .name(p.getName())
                    .imageUrl(p.getImageUrl())
                    .unit(p.getUnit())
                    .pricePerUnit(price)
                    .quantity(item.getQuantity())
                    .lineTotal(lineTotal)
                    .availableStock(p.getQuantityAvailable())
                    .farmerId(p.getFarmer().getId())
                    .farmerName(p.getFarmer().getFullName())
                    .farmName(p.getFarmer().getProfile() != null ? p.getFarmer().getProfile().getFarmName() : "")
                    .available(available)
                    .unavailableReason(reason)
                    .build());
        }

        return CartResponse.builder()
                .items(responseItems)
                .itemCount(responseItems.size())
                .totalAmount(total)
                .build();
    }

    @Transactional
    public void addToCart(Long customerId, CartAddRequest request) {
        Product product = productRepository.findPublicById(request.getProductId())
                .orElseThrow(() -> new ProductUnavailableException("Product is hidden, deleted, or unavailable"));

        validateQuantity(request.getQuantity(), product);

        CartItem item = cartItemRepository.findByCustomerIdAndProductId(customerId, product.getId())
                .orElse(null);

        if (item == null) {
            User customer = userRepository.getReferenceById(customerId);
            item = CartItem.builder()
                    .customer(customer)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
        } else {
            BigDecimal newQty = item.getQuantity().add(request.getQuantity());
            validateQuantity(newQty, product);
            item.setQuantity(newQty);
        }

        cartItemRepository.save(item);
    }

    @Transactional
    public void updateQuantity(Long customerId, Long itemId, CartUpdateRequest request) {
        CartItem item = getCartItemBelongingToCustomer(itemId, customerId);
        validateQuantity(request.getQuantity(), item.getProduct());
        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);
    }

    @Transactional
    public void removeItem(Long customerId, Long itemId) {
        CartItem item = getCartItemBelongingToCustomer(itemId, customerId);
        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long customerId) {
        cartItemRepository.deleteByCustomerId(customerId);
    }

    private void validateQuantity(BigDecimal qty, Product product) {
        if (product.getQuantityAvailable().compareTo(qty) < 0) {
            throw new ProductUnavailableException("Only " + product.getQuantityAvailable() + " " + product.getUnit() + " available");
        }

        if (product.getUnit() == ProductUnit.DOZEN || product.getUnit() == ProductUnit.PIECE) {
            if (qty.remainder(BigDecimal.ONE).compareTo(BigDecimal.ZERO) != 0) {
                throw new IllegalArgumentException("Quantity must be a whole number for " + product.getUnit());
            }
        } else {
            if (qty.compareTo(new BigDecimal("0.25")) < 0) {
                throw new IllegalArgumentException("Minimum quantity is 0.25 " + product.getUnit());
            }
        }
    }

    private CartItem getCartItemBelongingToCustomer(Long itemId, Long customerId) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));
        if (!item.getCustomer().getId().equals(customerId)) {
            throw new ResourceNotFoundException("Cart item not found");
        }
        return item;
    }
}
