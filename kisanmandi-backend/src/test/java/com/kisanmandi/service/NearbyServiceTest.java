package com.kisanmandi.service;

import com.kisanmandi.dto.NearbyFarmerResponse;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.NearbyFarmerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NearbyServiceTest {

    @Mock
    private NearbyFarmerRepository nearbyFarmerRepository;

    @Mock
    private FarmerProfileRepository farmerProfileRepository;

    @InjectMocks
    private NearbyService nearbyService;

    @Test
    void findNearbyFarmers_invalidLatitude_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(91.0, 74.0, 50.0));
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(-95.0, 74.0, 50.0));
    }

    @Test
    void findNearbyFarmers_invalidLongitude_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(20.0, 185.0, 50.0));
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(20.0, -181.0, 50.0));
    }

    @Test
    void findNearbyFarmers_invalidRadius_throwsException() {
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(20.0, 74.0, 0.0));
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(20.0, 74.0, -5.0));
        assertThrows(IllegalArgumentException.class, () -> nearbyService.findNearbyFarmers(20.0, 74.0, 1500.0));
    }

    @Test
    void findNearbyFarmers_roundsDistanceToOneDecimalPlace() {
        User user = User.builder().id(1L).name("Ramesh").role(Role.FARMER).build();
        FarmerProfile profile = FarmerProfile.builder()
                .id(10L)
                .user(user)
                .farmName("Green Farms")
                .village("Dhule Village")
                .district("Dhule")
                .state("Maharashtra")
                .approvalStatus(ApprovalStatus.APPROVED)
                .ratingAvg(new BigDecimal("4.80"))
                .ratingCount(12)
                .build();

        // Native query returns [profileId, distance] with raw floating point 12.3456
        Object[] row = new Object[]{10L, 12.3456};
        List<Object[]> rows = java.util.Collections.singletonList(row);
        when(nearbyFarmerRepository.findNearbyFarmerIdsNative(20.9042, 74.7749, 50.0))
                .thenReturn(rows);
        when(farmerProfileRepository.findById(10L)).thenReturn(Optional.of(profile));

        List<NearbyFarmerResponse> results = nearbyService.findNearbyFarmers(20.9042, 74.7749, 50.0);

        assertEquals(1, results.size());
        assertEquals(12.3, results.get(0).getDistanceKm(), 0.001);
        assertEquals("Green Farms", results.get(0).getFarmer().getFarmName());
    }

    @Test
    void calculateBoundingBox_standardCoordinates_returnsValidBox() {
        NearbyService.BoundingBox box = nearbyService.calculateBoundingBox(20.0, 74.0, 50.0);

        assertTrue(box.minLat() < 20.0);
        assertTrue(box.maxLat() > 20.0);
        assertTrue(box.minLng() < 74.0);
        assertTrue(box.maxLng() > 74.0);
    }

    @Test
    void calculateBoundingBox_nearPole_triggersPoleGuard() {
        // At 89.5 degrees north latitude (near North Pole)
        NearbyService.BoundingBox box = nearbyService.calculateBoundingBox(89.5, 50.0, 100.0);

        assertEquals(-180.0, box.minLng());
        assertEquals(180.0, box.maxLng());
        assertTrue(box.maxLat() <= 90.0);
    }
}
