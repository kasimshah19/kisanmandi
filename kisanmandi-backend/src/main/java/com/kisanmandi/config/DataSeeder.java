package com.kisanmandi.config;

import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Runs at startup — creates a default admin user if one doesn't exist yet
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @SuppressWarnings("null")
    public void run(String... args) {
        // If admin email or password is not set, print a warning and skip
        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("⚠ ADMIN_EMAIL or ADMIN_PASSWORD not set in application-local.properties. " +
                     "Skipping admin user creation.");
            return;
        }

        // Only create admin if no admin user exists
        if (!userRepository.existsByRole(Role.ADMIN)) {
            User admin = User.builder()
                    .name("Admin")
                    .email(adminEmail.toLowerCase().trim())
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(admin);
            log.info("✅ Default admin user created with email: {}", adminEmail);
            // Never log the password!
        } else {
            log.info("ℹ Admin user already exists. Skipping creation.");
        }
    }
}
