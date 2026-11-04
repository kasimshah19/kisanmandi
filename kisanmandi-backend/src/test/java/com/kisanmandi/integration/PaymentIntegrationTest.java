package com.kisanmandi.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kisanmandi.dto.CreatePaymentOrderRequest;
import com.kisanmandi.dto.PaymentVerificationRequest;
import com.kisanmandi.entity.*;
import com.kisanmandi.repository.AddressRepository;
import com.kisanmandi.repository.OrderRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import com.kisanmandi.security.JwtUtil;
import com.kisanmandi.service.PaymentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.UUID;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PaymentIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private com.kisanmandi.repository.PaymentRepository paymentRepository;

    @Autowired
    private com.kisanmandi.repository.PaymentEventRepository paymentEventRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PaymentService paymentService;

    private User customer;
    private User farmer;
    private Order testOrder;
    private String customerJwt;

    @BeforeEach
    void setup() {
        paymentEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        addressRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .name("Test Customer")
                .email("cust_" + UUID.randomUUID() + "@example.com")
                .password("$2a$10$hashedpasswordplaceholder")
                .phone("9876543210")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .tokenVersion(1)
                .build());

        farmer = userRepository.save(User.builder()
                .name("Test Farmer")
                .email("farmer_" + UUID.randomUUID() + "@example.com")
                .password("$2a$10$hashedpasswordplaceholder")
                .phone("9876543211")
                .role(Role.FARMER)
                .status(UserStatus.ACTIVE)
                .emailVerified(true)
                .tokenVersion(1)
                .build());

        testOrder = orderRepository.save(Order.builder()
                .customer(customer)
                .farmer(farmer)
                .totalAmount(new BigDecimal("450.00"))
                .status(OrderStatus.AWAITING_PAYMENT)
                .paymentMode(PaymentMode.ONLINE)
                .paymentStatus(PaymentStatus.PENDING)
                .shipName("Test Customer")
                .shipPhone("9876543210")
                .shipLine1("Farm Road 1")
                .shipCity("Pune")
                .shipState("Maharashtra")
                .shipPincode("411001")
                .build());

        customerJwt = jwtUtil.generateToken(customer.getEmail(), customer.getRole().name(), customer.getTokenVersion());
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        paymentEventRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        addressRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("GET /api/config/public returns payment status and key")
    void testGetPublicConfig() throws Exception {
        mockMvc.perform(get("/api/config/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentEnabled").isBoolean());
    }

    @Test
    @DisplayName("POST /api/payment/create-order generates gateway order id and saves on order")
    void testCreatePaymentOrder() throws Exception {
        CreatePaymentOrderRequest request = new CreatePaymentOrderRequest(testOrder.getId());

        mockMvc.perform(post("/api/payment/create-order")
                        .header("Authorization", "Bearer " + customerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId", is(testOrder.getId().intValue())))
                .andExpect(jsonPath("$.razorpayOrderId", notNullValue()))
                .andExpect(jsonPath("$.amount", is(450.0)));

        Order updated = orderRepository.findById(testOrder.getId()).orElseThrow();
        assertNotNull(updated.getRazorpayOrderId());
        assertEquals(PaymentMode.ONLINE, updated.getPaymentMode());
    }

    @Test
    @DisplayName("POST /api/payment/verify with mock signature sets order to PAID")
    void testVerifyPaymentSuccess() throws Exception {
        CreatePaymentOrderRequest orderReq = new CreatePaymentOrderRequest(testOrder.getId());
        mockMvc.perform(post("/api/payment/create-order")
                        .header("Authorization", "Bearer " + customerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(orderReq)))
                .andExpect(status().isOk());

        Order updatedBefore = orderRepository.findById(testOrder.getId()).orElseThrow();

        PaymentVerificationRequest request = new PaymentVerificationRequest(
                testOrder.getId(),
                updatedBefore.getRazorpayOrderId(),
                "pay_mock_test123",
                "mock_sig_valid"
        );

        mockMvc.perform(post("/api/payment/verify")
                        .header("Authorization", "Bearer " + customerJwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verified", is(true)));

        Order updated = orderRepository.findById(testOrder.getId()).orElseThrow();
        assertEquals(OrderStatus.PLACED, updated.getStatus());
        assertEquals(PaymentStatus.PAID, updated.getPaymentStatus());
        assertEquals("pay_mock_test123", updated.getRazorpayPaymentId());
    }

    @Test
    @DisplayName("processRefund marks online paid order with refundStatus REQUIRED")
    void testProcessRefund() {
        testOrder.setPaymentMode(PaymentMode.ONLINE);
        testOrder.setPaymentStatus(PaymentStatus.PAID);
        testOrder.setRazorpayPaymentId("pay_test_refund_123");
        orderRepository.save(testOrder);

        paymentService.processRefund(testOrder, "Customer requested cancel");

        Order refunded = orderRepository.findById(testOrder.getId()).orElseThrow();
        assertEquals(RefundStatus.REQUIRED, refunded.getRefundStatus());
    }
}
