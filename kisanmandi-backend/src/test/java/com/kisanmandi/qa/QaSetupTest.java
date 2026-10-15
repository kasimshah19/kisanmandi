package com.kisanmandi.qa;

import com.kisanmandi.entity.*;
import com.kisanmandi.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootTest
@ActiveProfiles("local")
public class QaSetupTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FarmerProfileRepository farmerProfileRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void setupQaIdentities() {
        // 1. QA Customer
        User customer = userRepository.findByEmail("qa_customer1@example.test").orElse(null);
        if (customer == null) {
            customer = User.builder()
                    .name("QA Customer 1")
                    .email("qa_customer1@example.test")
                    .password(passwordEncoder.encode("Pass@12345"))
                    .phone("9876543210")
                    .role(Role.CUSTOMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(customer);
            System.out.println("Created qa_customer1@example.test");
        } else {
            customer.setStatus(UserStatus.ACTIVE);
            customer.setRole(Role.CUSTOMER);
            userRepository.save(customer);
            System.out.println("Updated qa_customer1@example.test");
        }

        // 2. QA Farmer
        User farmer = userRepository.findByEmail("qa_farmer1@example.test").orElse(null);
        if (farmer == null) {
            farmer = User.builder()
                    .name("QA Farmer 1")
                    .email("qa_farmer1@example.test")
                    .password(passwordEncoder.encode("Pass@12345"))
                    .phone("9876543211")
                    .role(Role.FARMER)
                    .status(UserStatus.ACTIVE)
                    .build();
            farmer = userRepository.save(farmer);
            System.out.println("Created qa_farmer1@example.test");
        } else {
            farmer.setStatus(UserStatus.ACTIVE);
            farmer.setRole(Role.FARMER);
            farmer = userRepository.save(farmer);
            System.out.println("Updated qa_farmer1@example.test");
        }

        FarmerProfile profile = farmerProfileRepository.findByUserId(farmer.getId()).orElse(null);
        if (profile == null) {
            profile = FarmerProfile.builder()
                    .user(farmer)
                    .farmName("QA Green Farm")
                    .village("Haveli")
                    .state("Maharashtra")
                    .district("Pune")
                    .pincode("411001")
                    .latitude(18.5204)
                    .longitude(73.8567)
                    .approvalStatus(ApprovalStatus.APPROVED)
                    .reviewedAt(LocalDateTime.now())
                    .ratingAvg(java.math.BigDecimal.ZERO)
                    .ratingCount(0)
                    .build();
            farmerProfileRepository.save(profile);
            System.out.println("Created approved profile for qa_farmer1");
        } else {
            profile.setApprovalStatus(ApprovalStatus.APPROVED);
            farmerProfileRepository.save(profile);
            System.out.println("Ensured approved profile for qa_farmer1");
        }

        // 3. QA Admin
        User admin = userRepository.findByEmail("qa_admin1@example.test").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .name("QA Admin 1")
                    .email("qa_admin1@example.test")
                    .password(passwordEncoder.encode("Pass@12345"))
                    .phone("9876543212")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build();
            userRepository.save(admin);
            System.out.println("Created qa_admin1@example.test");
        } else {
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            System.out.println("Updated qa_admin1@example.test");
        }
    }

    @Test
    void inspectExistingData() {
        System.out.println("=== INSPECTING DB DATA ===");
        userRepository.findAll().forEach(u -> 
            System.out.println("USER: id=" + u.getId() + ", email=" + u.getEmail() + ", role=" + u.getRole() + ", status=" + u.getStatus())
        );
        orderRepository.findAll().forEach(o ->
            System.out.println("ORDER: id=" + o.getId() + ", customer=" + o.getCustomer().getId() + ", farmer=" + o.getFarmer().getId() + ", status=" + o.getStatus() + ", total=" + o.getTotalAmount())
        );
        productRepository.findAll().forEach(p ->
            System.out.println("PRODUCT: id=" + p.getId() + ", name=" + p.getName() + ", price=" + p.getPricePerUnit() + ", qty=" + p.getQuantityAvailable() + ", active=" + p.isActive() + ", deleted=" + p.isDeleted())
        );
        farmerProfileRepository.findAll().forEach(fp ->
            System.out.println("FARMER_PROFILE: id=" + fp.getId() + ", userId=" + fp.getUser().getId() + ", farm=" + fp.getFarmName() + ", status=" + fp.getApprovalStatus())
        );
        System.out.println("=== INSPECTING DB DATA END ===");
    }
}
