package com.kisanmandi.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.config.PaymentConfig;
import com.kisanmandi.dto.*;
import com.kisanmandi.entity.*;
import com.kisanmandi.event.OrderPlacedEvent;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.service.payment.PaymentGatewayException;
import com.kisanmandi.repository.*;
import com.kisanmandi.service.payment.FakePaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentCoreUnitTest {

    @Mock
    private OrderRepository orderRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentEventRepository paymentEventRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private AddressRepository addressRepository;
    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private AppMetricsService appMetricsService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private ApplicationEventPublisher eventPublisher;

    private PaymentConfig paymentConfig;
    private FakePaymentGateway fakePaymentGateway;
    private PaymentService paymentService;
    private OrderService orderService;
    private ObjectMapper objectMapper;

    private User customer;
    private User farmer;
    private Order testOrder;
    private Payment testPayment;

    private static final String TEST_KEY_ID = "rzp_test_mockKey123";
    private static final String TEST_KEY_SECRET = "mockSecretKey456";
    private static final String TEST_WEBHOOK_SECRET = "mockWebhookSecret789";

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        fakePaymentGateway = new FakePaymentGateway(TEST_KEY_ID, TEST_KEY_SECRET, TEST_WEBHOOK_SECRET);

        paymentConfig = mock(PaymentConfig.class);
        lenient().when(paymentConfig.isOnlineEnabled()).thenReturn(true);
        lenient().when(paymentConfig.getPublicRazorpayKeyId()).thenReturn(TEST_KEY_ID);
        lenient().when(paymentConfig.getWindowMinutes()).thenReturn(15);

        paymentService = new PaymentService(
                orderRepository,
                paymentRepository,
                paymentEventRepository,
                productRepository,
                userRepository,
                fakePaymentGateway,
                paymentConfig,
                appMetricsService,
                notificationService,
                eventPublisher,
                objectMapper
        );

        orderService = new OrderService(
                orderRepository,
                cartItemRepository,
                addressRepository,
                productRepository,
                userRepository,
                reviewRepository,
                appMetricsService,
                paymentService,
                eventPublisher
        );

        customer = User.builder().id(1L).email("customer@test.com").name("Test Customer").phone("9876543210").build();
        farmer = User.builder().id(2L).email("farmer@test.com").name("Test Farmer").phone("9876543211").build();

        testOrder = Order.builder()
                .id(100L)
                .customer(customer)
                .farmer(farmer)
                .paymentMode(PaymentMode.ONLINE)
                .status(OrderStatus.AWAITING_PAYMENT)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentGroupId("group-uuid-123")
                .paymentExpiresAt(LocalDateTime.now().plusMinutes(15))
                .totalAmount(new BigDecimal("150.00"))
                .refundStatus(RefundStatus.NONE)
                .items(new ArrayList<>())
                .history(new ArrayList<>())
                .build();

        testPayment = Payment.builder()
                .id(1L)
                .paymentGroupId("group-uuid-123")
                .customer(customer)
                .razorpayOrderId("order_rzp_123")
                .amountPaise(15000L)
                .currency("INR")
                .status(PaymentRecordStatus.CREATED)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build();
    }

    @Test
    @DisplayName("1. HMAC verify with known vectors matches SHA-256 hex")
    void testHmacWithKnownVectors() throws Exception {
        String orderId = "order_DBJOWzybf0sJbb";
        String paymentId = "pay_29QQoUBi66xm2f";
        String secret = "EnLs pathwaysSecret123";

        String payload = orderId + "|" + paymentId;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        String expectedSignature = HexFormat.of().formatHex(raw);

        FakePaymentGateway customGateway = new FakePaymentGateway("rzp_test_key", secret, "wh_sec");
        assertTrue(customGateway.verifyPaymentSignature(orderId, paymentId, expectedSignature));
        assertFalse(customGateway.verifyPaymentSignature(orderId, paymentId, "tampered_signature"));
    }

    @Test
    @DisplayName("2. Server paise conversion avoids floating-point precision issues")
    void testPaiseConversionPrecision() {
        BigDecimal val1 = new BigDecimal("99.99");
        long paise1 = val1.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        assertEquals(9999L, paise1);

        // 0.1 + 0.2 style values
        BigDecimal val2 = new BigDecimal("0.10").add(new BigDecimal("0.20"));
        long paise2 = val2.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        assertEquals(30L, paise2);

        BigDecimal val3 = new BigDecimal("1234.56");
        long paise3 = val3.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).longValueExact();
        assertEquals(123456L, paise3);
    }

    @Test
    @DisplayName("3. Verify is idempotent: twice calling returns success, transitions only once")
    void testVerifyIsIdempotent() {
        when(paymentRepository.findByRazorpayOrderId("order_rzp_123")).thenReturn(Optional.of(testPayment));
        when(orderRepository.findByPaymentGroupId("group-uuid-123")).thenReturn(List.of(testOrder));
        when(orderRepository.updateStatusIfCurrentStatus(100L, OrderStatus.AWAITING_PAYMENT, OrderStatus.PLACED)).thenReturn(1);

        String validSig = FakePaymentGateway.calculateHmac("order_rzp_123|pay_123", TEST_KEY_SECRET);
        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId("order_rzp_123")
                .razorpayPaymentId("pay_123")
                .razorpaySignature(validSig)
                .build();

        // First verification
        PaymentVerificationResponse res1 = paymentService.verifyPayment(customer.getId(), req);
        assertTrue(res1.isVerified());
        assertEquals(PaymentRecordStatus.PAID, testPayment.getStatus());
        assertEquals(OrderStatus.PLACED, testOrder.getStatus());
        verify(eventPublisher, times(1)).publishEvent(any(OrderPlacedEvent.class));

        // Second verification with already PAID status
        PaymentVerificationResponse res2 = paymentService.verifyPayment(customer.getId(), req);
        assertTrue(res2.isVerified());
        // Event should NOT be published a second time
        verify(eventPublisher, times(1)).publishEvent(any(OrderPlacedEvent.class));
    }

    @Test
    @DisplayName("4. Verify with wrong signature throws IllegalArgumentException and orders stay AWAITING_PAYMENT")
    void testVerifyWithWrongSignatureFails() {
        when(paymentRepository.findByRazorpayOrderId("order_rzp_123")).thenReturn(Optional.of(testPayment));

        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId("order_rzp_123")
                .razorpayPaymentId("pay_123")
                .razorpaySignature("bad_signature_hex")
                .build();

        assertThrows(IllegalArgumentException.class, () -> paymentService.verifyPayment(customer.getId(), req));
        assertEquals(OrderStatus.AWAITING_PAYMENT, testOrder.getStatus());
        assertEquals(PaymentRecordStatus.CREATED, testPayment.getStatus());
        verify(orderRepository, never()).updateStatusIfCurrentStatus(any(), any(), any());
    }

    @Test
    @DisplayName("5. Payment verification of another user throws ResourceNotFoundException (404)")
    void testVerifyAnotherUserPaymentThrows404() {
        when(paymentRepository.findByRazorpayOrderId("order_rzp_123")).thenReturn(Optional.of(testPayment));

        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId("order_rzp_123")
                .razorpayPaymentId("pay_123")
                .razorpaySignature("valid_sig")
                .build();

        assertThrows(ResourceNotFoundException.class, () -> paymentService.verifyPayment(999L, req));
    }

    @Test
    @DisplayName("6. Webhook with bad signature throws IllegalArgumentException")
    void testWebhookBadSignatureFails() {
        String payload = "{\"event\":\"payment.captured\"}";
        assertThrows(IllegalArgumentException.class, () ->
                paymentService.processWebhook(payload, "invalid_sig", "evt_123"));
    }

    @Test
    @DisplayName("7. Webhook duplicate event ID is ignored immediately without second transition")
    void testWebhookDuplicateEventIgnored() {
        when(paymentEventRepository.existsByEventId("evt_duplicate_123")).thenReturn(true);

        String payload = "{\"event\":\"payment.captured\"}";
        String sig = FakePaymentGateway.calculateHmac(payload, TEST_WEBHOOK_SECRET);

        paymentService.processWebhook(payload, sig, "evt_duplicate_123");

        verify(paymentRepository, never()).findByRazorpayOrderId(any());
        verify(orderRepository, never()).updateStatusIfCurrentStatus(any(), any(), any());
    }

    @Test
    @DisplayName("8. Expiry restores stock exactly once via atomic conditional update")
    void testExpiryRestoresStockExactlyOnce() {
        Product product = Product.builder().id(50L).name("Apple").quantityAvailable(new BigDecimal("10.00")).build();
        OrderItem item = OrderItem.builder().id(1L).product(product).quantity(new BigDecimal("2.00")).build();
        testOrder.getItems().add(item);

        when(orderRepository.findByStatusAndPaymentExpiresAtBefore(eq(OrderStatus.AWAITING_PAYMENT), any()))
                .thenReturn(List.of(testOrder));
        when(orderRepository.updateStatusIfCurrentStatus(100L, OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED))
                .thenReturn(1); // Won race
        when(paymentRepository.findByPaymentGroupId("group-uuid-123")).thenReturn(Optional.of(testPayment));

        paymentService.expirePendingOrders(LocalDateTime.now());

        assertEquals(OrderStatus.CANCELLED, testOrder.getStatus());
        assertEquals(PaymentRecordStatus.EXPIRED, testPayment.getStatus());
        verify(productRepository, times(1)).increaseStock(50L, new BigDecimal("2.00"));

        // If run again or concurrent thread runs where updated == 0:
        when(orderRepository.updateStatusIfCurrentStatus(100L, OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED))
                .thenReturn(0); // Lost race

        paymentService.expirePendingOrders(LocalDateTime.now());
        // Verify increaseStock was NOT called a second time
        verify(productRepository, times(1)).increaseStock(50L, new BigDecimal("2.00"));
    }

    @Test
    @DisplayName("9. Late payment arrival after expiry flags order refund_status = REQUIRED")
    void testLatePaymentAfterExpiryFlagsRefundRequired() {
        testOrder.setStatus(OrderStatus.CANCELLED);
        testPayment.setStatus(PaymentRecordStatus.EXPIRED);

        when(paymentRepository.findByRazorpayOrderId("order_rzp_123")).thenReturn(Optional.of(testPayment));
        when(orderRepository.findByPaymentGroupId("group-uuid-123")).thenReturn(List.of(testOrder));

        String validSig = FakePaymentGateway.calculateHmac("order_rzp_123|pay_123", TEST_KEY_SECRET);
        PaymentVerificationRequest req = PaymentVerificationRequest.builder()
                .razorpayOrderId("order_rzp_123")
                .razorpayPaymentId("pay_123")
                .razorpaySignature(validSig)
                .build();

        PaymentVerificationResponse res = paymentService.verifyPayment(customer.getId(), req);

        assertTrue(res.isVerified());
        assertEquals(PaymentRecordStatus.PAID, testPayment.getStatus());
        assertEquals(RefundStatus.REQUIRED, testOrder.getRefundStatus());
        verify(orderRepository).save(testOrder);
    }

    @Test
    @DisplayName("10. Gateway order failure triggers compensating cancellation and restores stock once")
    void testGatewayFailureCompensatingTransaction() {
        Category cat = Category.builder().id(1L).name("Fruits").active(true).build();
        FarmerProfile profile = FarmerProfile.builder().id(1L).approvalStatus(ApprovalStatus.APPROVED).farmName("Test Farm").build();
        farmer.setStatus(UserStatus.ACTIVE);
        farmer.setProfile(profile);

        Product product = Product.builder()
                .id(50L)
                .farmer(farmer)
                .category(cat)
                .name("Apple")
                .pricePerUnit(new BigDecimal("50.00"))
                .quantityAvailable(new BigDecimal("10.00"))
                .active(true)
                .deleted(false)
                .adminHidden(false)
                .build();
        CartItem cartItem = CartItem.builder().id(1L).customer(customer).product(product).quantity(new BigDecimal("2.00")).build();
        Address address = Address.builder().id(10L).user(customer).fullName("Customer").line1("Street 1").city("Pune").state("MH").pincode("411001").phone("9876543210").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.findById(2L)).thenReturn(Optional.of(farmer));
        when(cartItemRepository.findByCustomerIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(cartItem));
        when(addressRepository.findById(10L)).thenReturn(Optional.of(address));
        when(productRepository.decreaseStock(eq(50L), any())).thenReturn(1);

        when(orderRepository.save(any(Order.class))).thenAnswer(inv -> {
            Order o = inv.getArgument(0);
            o.setId(200L);
            return o;
        });

        // Simulate gateway outage
        fakePaymentGateway.setSimulateOrderCreationFailure(true);

        when(orderRepository.findByPaymentGroupId(any())).thenAnswer(inv -> {
            Order o = Order.builder().id(200L).status(OrderStatus.AWAITING_PAYMENT).items(List.of(OrderItem.builder().product(product).quantity(new BigDecimal("2.00")).build())).history(new ArrayList<>()).build();
            return List.of(o);
        });
        when(orderRepository.updateStatusIfCurrentStatus(200L, OrderStatus.AWAITING_PAYMENT, OrderStatus.CANCELLED)).thenReturn(1);

        CheckoutRequest checkoutReq = new CheckoutRequest();
        checkoutReq.setAddressId(10L);
        checkoutReq.setPaymentMode(PaymentMode.ONLINE);

        assertThrows(PaymentGatewayException.class, () -> orderService.checkout(customer.getId(), checkoutReq));

        // Verifies stock was restored in compensating transaction
        verify(productRepository).increaseStock(50L, new BigDecimal("2.00"));
    }

    @Test
    @DisplayName("11. Farmer stats pendingCash counts ONLY COD orders in progress")
    void testFarmerStatsPendingCashOnlyCod() {
        FarmerStatsService farmerStatsService = new FarmerStatsService(
                orderRepository,
                productRepository,
                mock(FarmerProfileRepository.class)
        );

        when(orderRepository.countByFarmerIdAndStatusNot(2L, OrderStatus.AWAITING_PAYMENT)).thenReturn(5L);
        when(orderRepository.countByFarmerIdAndStatus(2L, OrderStatus.PLACED)).thenReturn(2L);
        when(orderRepository.countByFarmerIdAndStatus(2L, OrderStatus.DELIVERED)).thenReturn(3L);
        when(orderRepository.sumPendingAmountByFarmerId(2L)).thenReturn(new BigDecimal("500.00"));
        when(orderRepository.sumPendingCodAmountByFarmerId(2L)).thenReturn(new BigDecimal("200.00")); // COD only

        FarmerStatsResponse stats = farmerStatsService.getStats(2L);

        assertEquals(new BigDecimal("200.00"), stats.getPendingCash());
        assertEquals(5L, stats.getTotalOrders());
    }

    @Test
    @DisplayName("12. FarmerOrderService filters out AWAITING_PAYMENT and getById throws 404")
    void testFarmerOrderServiceFiltersAwaitingPayment() {
        FarmerOrderService farmerOrderService = new FarmerOrderService(
                orderRepository,
                productRepository,
                appMetricsService,
                notificationService,
                paymentService,
                eventPublisher
        );

        // When status is explicitly AWAITING_PAYMENT, farmer gets empty page
        PageResponse<OrderSummaryResponse> page = farmerOrderService.list(2L, OrderStatus.AWAITING_PAYMENT, 0, 10);
        assertEquals(0, page.getContent().size());

        // When order is in AWAITING_PAYMENT, farmer get() throws ResourceNotFoundException (404)
        when(orderRepository.findWithItemsAndHistoryById(100L)).thenReturn(Optional.of(testOrder));
        assertThrows(ResourceNotFoundException.class, () -> farmerOrderService.get(2L, 100L));
    }
}
