package com.kisanmandi.qa;

import com.kisanmandi.dto.CartAddRequest;
import com.kisanmandi.dto.mandi.MandiStatusResponse;
import com.kisanmandi.entity.*;
import com.kisanmandi.exception.ProductUnavailableException;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.*;
import com.kisanmandi.service.*;
import org.junit.jupiter.api.DisplayName;
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
public class Round2RegressionTests {

    @Mock
    private MandiSyncLogRepository mandiSyncLogRepository;
    @Mock
    private MandiPriceRepository mandiPriceRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private FarmerProfileRepository farmerProfileRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private CartItemRepository cartItemRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private NearbyFarmerRepository nearbyFarmerRepository;

    @InjectMocks
    private MandiQueryService mandiQueryService;

    @InjectMocks
    private MandiDemoSeeder mandiDemoSeeder;

    @InjectMocks
    private ProductService productService;

    @InjectMocks
    private CartService cartService;

    @InjectMocks
    private NearbyService nearbyService;

    @Test
    @DisplayName("BUG-01: Mandi status returns 200 with null lastSync without throwing NPE")
    void mandiStatus_nullLastSync_returnsGracefulResponseWithoutNPE() {
        when(mandiPriceRepository.findLatestPriceDate()).thenReturn(Optional.empty());
        when(mandiPriceRepository.count()).thenReturn(0L);
        when(mandiSyncLogRepository.findFirstByOrderByStartedAtDesc()).thenReturn(Optional.empty());

        MandiStatusResponse status = mandiQueryService.getStatus();

        assertNotNull(status);
        assertNull(status.getLastSync());
        assertEquals(0L, status.getTotalRows());
        assertFalse(status.isRunning());
    }

    @Test
    @DisplayName("BUG-06: MandiDemoSeeder deletes ONLY DEMO rows (real API rows survive)")
    void mandiDemoSeeder_deletesOnlyDemoRows() {
        // When demo seeding is disabled via property, it cleans up demo rows only
        mandiDemoSeeder.seedDemoData();

        verify(mandiPriceRepository, times(1)).deleteBySource(PriceSource.DEMO);
        verify(mandiPriceRepository, never()).deleteBySource(PriceSource.API);
        verify(mandiPriceRepository, never()).deleteAll();
    }

    @Test
    @DisplayName("Product Ownership: Farmer can GET own inactive product; another farmer gets 404")
    void farmerProduct_ownerCanGetOwnInactiveProduct_otherFarmerGets404() {
        User ownerFarmer = User.builder().id(101L).name("Farmer Ram").role(Role.FARMER).build();
        Category cat = Category.builder().id(1L).name("Vegetables").active(true).build();
        Product inactiveProduct = Product.builder()
                .id(501L)
                .name("Inactive Carrots")
                .farmer(ownerFarmer)
                .category(cat)
                .pricePerUnit(BigDecimal.valueOf(40))
                .quantityAvailable(BigDecimal.valueOf(100))
                .unit(ProductUnit.KG)
                .active(false)
                .deleted(false)
                .build();

        when(productRepository.findById(501L)).thenReturn(Optional.of(inactiveProduct));

        // 1. Owner requests own inactive product -> succeeds
        var response = productService.getMyProduct(101L, 501L);
        assertNotNull(response);
        assertEquals(501L, response.getId());
        assertFalse(response.isActive());

        // 2. Different farmer requests same product -> throws 404 ResourceNotFoundException
        assertThrows(ResourceNotFoundException.class, () -> productService.getMyProduct(102L, 501L));
    }

    @Test
    @DisplayName("Nearby Haversine: Distance 0.0 with identical coordinates does not return null or NaN")
    void nearbyHaversine_zeroDistance_returnsCleanZero() {
        User farmerUser = User.builder().id(1L).name("Suresh").role(Role.FARMER).build();
        FarmerProfile profile = FarmerProfile.builder()
                .id(10L)
                .user(farmerUser)
                .farmName("Village Farm")
                .village("Wagholi")
                .district("Pune")
                .state("Maharashtra")
                .approvalStatus(ApprovalStatus.APPROVED)
                .ratingAvg(BigDecimal.valueOf(4.5))
                .ratingCount(10)
                .latitude(18.5204)
                .longitude(73.8567)
                .build();

        // Object array returned by Native Haversine query: [profile_id, distance]
        Object[] row = new Object[]{10L, 0.0};
        when(nearbyFarmerRepository.findNearbyFarmerIdsNative(18.5204, 73.8567, 25.0))
                .thenReturn(List.<Object[]>of(row));
        when(farmerProfileRepository.findById(10L)).thenReturn(Optional.of(profile));

        var results = nearbyService.findNearbyFarmers(18.5204, 73.8567, 25.0);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(0.0, results.get(0).getDistanceKm());
        assertFalse(Double.isNaN(results.get(0).getDistanceKm()));
    }

    @Test
    @DisplayName("Central Visibility Rule: Inactive, deleted, admin-hidden, unapproved/blocked farmer, inactive category are not visible")
    void visibilityRule_invalidProductsCannotBeAddedToCart() {
        Category activeCat = Category.builder().id(1L).name("Grains").active(true).build();
        Category inactiveCat = Category.builder().id(2L).name("Inactive").active(false).build();

        FarmerProfile approvedProfile = FarmerProfile.builder().id(1L).approvalStatus(ApprovalStatus.APPROVED).build();
        FarmerProfile pendingProfile = FarmerProfile.builder().id(2L).approvalStatus(ApprovalStatus.PENDING).build();

        User activeFarmer = User.builder().id(2L).name("Farmer").role(Role.FARMER).status(UserStatus.ACTIVE).profile(approvedProfile).build();
        User blockedFarmer = User.builder().id(3L).name("Blocked").role(Role.FARMER).status(UserStatus.BLOCKED).profile(approvedProfile).build();
        User pendingFarmer = User.builder().id(4L).name("Pending").role(Role.FARMER).status(UserStatus.ACTIVE).profile(pendingProfile).build();

        // Base valid product
        Product valid = Product.builder().id(10L).farmer(activeFarmer).category(activeCat).name("Wheat").active(true).deleted(false).adminHidden(false).build();
        assertTrue(valid.isPubliclyVisible());

        // 1. Inactive product
        Product inactive = Product.builder().id(11L).farmer(activeFarmer).category(activeCat).name("Wheat").active(false).deleted(false).adminHidden(false).build();
        assertFalse(inactive.isPubliclyVisible());

        // 2. Deleted product
        Product deleted = Product.builder().id(12L).farmer(activeFarmer).category(activeCat).name("Wheat").active(true).deleted(true).adminHidden(false).build();
        assertFalse(deleted.isPubliclyVisible());

        // 3. Admin-hidden product
        Product adminHidden = Product.builder().id(13L).farmer(activeFarmer).category(activeCat).name("Wheat").active(true).deleted(false).adminHidden(true).build();
        assertFalse(adminHidden.isPubliclyVisible());

        // 4. Inactive Category
        Product inactiveCategory = Product.builder().id(14L).farmer(activeFarmer).category(inactiveCat).name("Wheat").active(true).deleted(false).adminHidden(false).build();
        assertFalse(inactiveCategory.isPubliclyVisible());

        // 5. Blocked Farmer
        Product blockedFarmerProduct = Product.builder().id(15L).farmer(blockedFarmer).category(activeCat).name("Wheat").active(true).deleted(false).adminHidden(false).build();
        assertFalse(blockedFarmerProduct.isPubliclyVisible());

        // 6. Unapproved Farmer
        Product pendingFarmerProduct = Product.builder().id(16L).farmer(pendingFarmer).category(activeCat).name("Wheat").active(true).deleted(false).adminHidden(false).build();
        assertFalse(pendingFarmerProduct.isPubliclyVisible());

        // Cart Add Rejection
        when(productRepository.findPublicById(999L)).thenReturn(Optional.empty());
        assertThrows(ProductUnavailableException.class, () -> cartService.addToCart(1L, new CartAddRequest(999L, BigDecimal.ONE)));
    }
}
