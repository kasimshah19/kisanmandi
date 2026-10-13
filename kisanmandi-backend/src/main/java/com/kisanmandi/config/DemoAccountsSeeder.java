package com.kisanmandi.config;

import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Optional seeder for demo accounts in staging/test environments
@Component
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true", matchIfMissing = false)
public class DemoAccountsSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoAccountsSeeder.class);

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.demo.customer-email:}")
    private String customerEmail;

    @Value("${app.demo.customer-password:}")
    private String customerPassword;

    @Value("${app.demo.farmer-email:}")
    private String farmerEmail;

    @Value("${app.demo.farmer-password:}")
    private String farmerPassword;

    public DemoAccountsSeeder(UserRepository userRepository,
                              FarmerProfileRepository farmerProfileRepository,
                              PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (customerEmail == null || customerEmail.isBlank() ||
            customerPassword == null || customerPassword.isBlank() ||
            farmerEmail == null || farmerEmail.isBlank() ||
            farmerPassword == null || farmerPassword.isBlank()) {
            log.warn("app.demo.enabled=true but one or more demo credentials (customer-email, customer-password, farmer-email, farmer-password) are empty. Skipping demo accounts creation.");
            return;
        }

        seedCustomer();
        seedFarmer();
    }

    private void seedCustomer() {
        String email = customerEmail.toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            log.info("Demo customer already exists ({}). Skipping.", email);
            return;
        }

        User customer = User.builder()
                .name("Demo Customer")
                .email(email)
                .password(passwordEncoder.encode(customerPassword))
                .phone("9876543210")
                .role(Role.CUSTOMER)
                .status(com.kisanmandi.entity.UserStatus.ACTIVE)
                .build();

        userRepository.save(customer);
        log.info("Demo customer created: {}", email);
    }

    private void seedFarmer() {
        String email = farmerEmail.toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            log.info("Demo farmer already exists ({}). Skipping.", email);
            return;
        }

        User farmer = User.builder()
                .name("Demo Farmer")
                .email(email)
                .password(passwordEncoder.encode(farmerPassword))
                .phone("9876543211")
                .role(Role.FARMER)
                .status(com.kisanmandi.entity.UserStatus.ACTIVE)
                .build();

        User savedFarmer = userRepository.save(farmer);

        FarmerProfile profile = FarmerProfile.builder()
                .user(savedFarmer)
                .farmName("Kisan Demo Farm")
                .village("Dhule Rural")
                .district("Dhule")
                .state("Maharashtra")
                .pincode("424001")
                .latitude(20.9042)
                .longitude(74.7749)
                .approvalStatus(ApprovalStatus.APPROVED)
                .reviewedAt(LocalDateTime.now())
                .ratingAvg(BigDecimal.ZERO)
                .ratingCount(0)
                .build();

        farmerProfileRepository.save(profile);
        log.info("Demo farmer created and approved: {}", email);
    }
}
