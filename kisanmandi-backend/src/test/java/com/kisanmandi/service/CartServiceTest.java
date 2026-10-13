package com.kisanmandi.service;

import com.kisanmandi.dto.CartAddRequest;
import com.kisanmandi.entity.CartItem;
import com.kisanmandi.entity.Product;
import com.kisanmandi.entity.ProductUnit;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.ProductUnavailableException;
import com.kisanmandi.repository.CartItemRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    private CartService cartService;

    @BeforeEach
    void setUp() {
        cartService = new CartService(cartItemRepository, productRepository, userRepository);
    }

    private Product createProduct(Long id, BigDecimal stock, ProductUnit unit) {
        return Product.builder()
                .id(id)
                .name("Test Product")
                .quantityAvailable(stock)
                .unit(unit)
                .pricePerUnit(new BigDecimal("50.00"))
                .active(true)
                .deleted(false)
                .adminHidden(false)
                .build();
    }

    @Test
    @DisplayName("Cart: Add new product item successfully")
    void addToCart_newItem_success() {
        Product product = createProduct(1L, new BigDecimal("10.00"), ProductUnit.KG);
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("2.00"));
        User user = User.builder().id(100L).build();

        when(productRepository.findPublicById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(100L, 1L)).thenReturn(Optional.empty());
        when(userRepository.getReferenceById(100L)).thenReturn(user);

        cartService.addToCart(100L, request);

        ArgumentCaptor<CartItem> captor = ArgumentCaptor.forClass(CartItem.class);
        verify(cartItemRepository).save(captor.capture());
        assertEquals(new BigDecimal("2.00"), captor.getValue().getQuantity());
        assertEquals(product, captor.getValue().getProduct());
    }

    @Test
    @DisplayName("Cart: Adding same product increases existing quantity")
    void addToCart_existingItem_increasesQuantity() {
        Product product = createProduct(1L, new BigDecimal("10.00"), ProductUnit.KG);
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("2.00"));
        CartItem existingItem = CartItem.builder().id(5L).product(product).quantity(new BigDecimal("3.00")).build();

        when(productRepository.findPublicById(1L)).thenReturn(Optional.of(product));
        when(cartItemRepository.findByCustomerIdAndProductId(100L, 1L)).thenReturn(Optional.of(existingItem));

        cartService.addToCart(100L, request);

        verify(cartItemRepository).save(existingItem);
        assertEquals(new BigDecimal("5.00"), existingItem.getQuantity());
    }

    @Test
    @DisplayName("Cart: Quantity exceeding stock is rejected")
    void addToCart_quantityExceedsStock_rejected() {
        Product product = createProduct(1L, new BigDecimal("5.00"), ProductUnit.KG);
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("10.00"));

        when(productRepository.findPublicById(1L)).thenReturn(Optional.of(product));

        assertThrows(ProductUnavailableException.class, () -> cartService.addToCart(100L, request));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Cart: Non-integer quantity for PIECE or DOZEN is rejected")
    void addToCart_pieceNonInteger_rejected() {
        Product product = createProduct(1L, new BigDecimal("20.00"), ProductUnit.PIECE);
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("1.50"));

        when(productRepository.findPublicById(1L)).thenReturn(Optional.of(product));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> cartService.addToCart(100L, request));
        assertTrue(ex.getMessage().contains("whole number"));
    }

    @Test
    @DisplayName("Cart: Minimum quantity for KG is 0.25")
    void addToCart_kgUnderMinimum_rejected() {
        Product product = createProduct(1L, new BigDecimal("20.00"), ProductUnit.KG);
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("0.10"));

        when(productRepository.findPublicById(1L)).thenReturn(Optional.of(product));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> cartService.addToCart(100L, request));
        assertTrue(ex.getMessage().contains("Minimum quantity"));
    }

    @Test
    @DisplayName("Cart: Inactive or deleted product is rejected")
    void addToCart_inactiveProduct_rejected() {
        CartAddRequest request = new CartAddRequest(1L, new BigDecimal("1.00"));
        when(productRepository.findPublicById(1L)).thenReturn(Optional.empty());

        assertThrows(ProductUnavailableException.class, () -> cartService.addToCart(100L, request));
        verify(cartItemRepository, never()).save(any());
    }
}
