package com.kisanmandi.config;

import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DemoAccountsSeederTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DemoAccountsSeeder seeder;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(seeder, "customerEmail", "customer@demo.com");
        ReflectionTestUtils.setField(seeder, "customerPassword", "DemoCust@123");
        ReflectionTestUtils.setField(seeder, "farmerEmail", "farmer@demo.com");
        ReflectionTestUtils.setField(seeder, "farmerPassword", "DemoFarm@123");
    }

    @Test
    void run_emptyCredentials_skipsCreation() {
        ReflectionTestUtils.setField(seeder, "customerPassword", "");

        seeder.run();

        verify(userRepository, never()).save(any());
        verify(farmerProfileRepository, never()).save(any());
    }

    @Test
    void run_usersDoNotExist_createsCustomerAndApprovedFarmer() {
        when(userRepository.existsByEmail("customer@demo.com")).thenReturn(false);
        when(userRepository.existsByEmail("farmer@demo.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password");

        User farmerUser = User.builder().id(20L).email("farmer@demo.com").role(Role.FARMER).build();
        when(userRepository.save(any(User.class))).thenReturn(farmerUser);

        seeder.run();

        verify(userRepository, times(2)).save(any(User.class));
        ArgumentCaptor<FarmerProfile> profileCaptor = ArgumentCaptor.forClass(FarmerProfile.class);
        verify(farmerProfileRepository).save(profileCaptor.capture());

        FarmerProfile profile = profileCaptor.getValue();
        assertEquals("Dhule", profile.getDistrict());
        assertEquals(20.9042, profile.getLatitude());
        assertEquals(74.7749, profile.getLongitude());
        assertEquals(ApprovalStatus.APPROVED, profile.getApprovalStatus());
    }

    @Test
    void run_usersAlreadyExist_idempotentDoesNothing() {
        when(userRepository.existsByEmail("customer@demo.com")).thenReturn(true);
        when(userRepository.existsByEmail("farmer@demo.com")).thenReturn(true);

        seeder.run();

        verify(userRepository, never()).save(any());
        verify(farmerProfileRepository, never()).save(any());
    }
}
