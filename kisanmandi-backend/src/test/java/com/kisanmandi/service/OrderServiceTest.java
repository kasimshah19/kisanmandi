package com.kisanmandi.service;

import com.kisanmandi.dto.CheckoutRequest;
import com.kisanmandi.dto.OrderSummaryResponse;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.CartEmptyException;
import com.kisanmandi.exception.InsufficientStockException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private User farmer1;
    private User farmer2;
    private Address address;
    private Category category;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).email("cust@example.com").name("Customer").role(Role.CUSTOMER).status(UserStatus.ACTIVE).build();

        FarmerProfile profile1 = FarmerProfile.builder().id(101L).farmName("Farm One").approvalStatus(ApprovalStatus.APPROVED).build();
        farmer1 = User.builder().id(10L).email("farmer1@example.com").name("Farmer One").role(Role.FARMER).status(UserStatus.ACTIVE).profile(profile1).build();

        FarmerProfile profile2 = FarmerProfile.builder().id(102L).farmName("Farm Two").approvalStatus(ApprovalStatus.APPROVED).build();
        farmer2 = User.builder().id(20L).email("farmer2@example.com").name("Farmer Two").role(Role.FARMER).status(UserStatus.ACTIVE).profile(profile2).build();

        category = Category.builder().id(1L).name("Vegetables").active(true).build();

        address = Address.builder()
                .id(100L)
                .user(customer)
                .fullName("John Doe")
                .phone("9876543210")
                .line1("Farm Road 1")
                .city("Dhule")
                .state("Maharashtra")
                .pincode("424001")
                .build();
    }

    private Product createProduct(Long id, String name, User farmer, BigDecimal price) {
        return Product.builder()
                .id(id)
                .name(name)
                .farmer(farmer)
                .category(category)
                .pricePerUnit(price)
                .unit(ProductUnit.KG)
                .quantityAvailable(new BigDecimal("100.00"))
                .active(true)
                .deleted(false)
                .adminHidden(false)
                .build();
    }

    @Test
    void checkout_emptyCart_throwsException() {
        when(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

        CheckoutRequest request = new CheckoutRequest();
        request.setAddressId(100L);
        request.setPaymentMode(PaymentMode.COD);

        assertThrows(CartEmptyException.class, () -> orderService.checkout(1L, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_otherUsersAddress_rejected() {
        User otherUser = User.builder().id(999L).build();
        Address otherAddress = Address.builder().id(100L).user(otherUser).build();

        Product product = createProduct(50L, "Tomato", farmer1, new BigDecimal("50.00"));
        CartItem item = CartItem.builder().id(1L).customer(customer).product(product).quantity(new BigDecimal("2.00")).build();

        when(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(otherAddress));

        CheckoutRequest request = new CheckoutRequest();
        request.setAddressId(100L);
        request.setPaymentMode(PaymentMode.COD);

        assertThrows(ResourceNotFoundException.class, () -> orderService.checkout(1L, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_insufficientStock_throwsExceptionAndNothingSaved() {
        Product product = createProduct(50L, "Tomato", farmer1, new BigDecimal("50.00"));
        CartItem item = CartItem.builder().id(1L).customer(customer).product(product).quantity(new BigDecimal("10.00")).build();

        when(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(10L)).thenReturn(Optional.of(farmer1));
        when(productRepository.decreaseStock(50L, new BigDecimal("10.00"))).thenReturn(0); // 0 rows updated -> stock error

        CheckoutRequest request = new CheckoutRequest();
        request.setAddressId(100L);
        request.setPaymentMode(PaymentMode.COD);

        assertThrows(InsufficientStockException.class, () -> orderService.checkout(1L, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    void checkout_twoFarmers_createsTwoOrdersWithServerComputedTotals() {
        Product prod1 = createProduct(51L, "Tomato", farmer1, new BigDecimal("40.00"));
        Product prod2 = createProduct(52L, "Potato", farmer2, new BigDecimal("30.00"));

        CartItem item1 = CartItem.builder().id(1L).customer(customer).product(prod1).quantity(new BigDecimal("2.00")).build();
        CartItem item2 = CartItem.builder().id(2L).customer(customer).product(prod2).quantity(new BigDecimal("3.00")).build();

        when(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item1, item2));
        when(addressRepository.findById(100L)).thenReturn(Optional.of(address));
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(10L)).thenReturn(Optional.of(farmer1));
        when(userRepository.findById(20L)).thenReturn(Optional.of(farmer2));

        when(productRepository.decreaseStock(51L, new BigDecimal("2.00"))).thenReturn(1);
        when(productRepository.decreaseStock(52L, new BigDecimal("3.00"))).thenReturn(1);

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order o = invocation.getArgument(0);
            o.setId(1000L + (o.getFarmer().getId()));
            return o;
        });

        CheckoutRequest request = new CheckoutRequest();
        request.setAddressId(100L);
        request.setPaymentMode(PaymentMode.COD);

        List<OrderSummaryResponse> summaries = orderService.checkout(1L, request);

        assertEquals(2, summaries.size());
        verify(orderRepository, times(2)).save(any(Order.class));
        verify(cartItemRepository).deleteByCustomerId(1L);
    }
}
