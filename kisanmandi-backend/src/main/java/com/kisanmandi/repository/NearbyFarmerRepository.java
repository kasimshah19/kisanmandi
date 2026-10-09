package com.kisanmandi.repository;

import com.kisanmandi.entity.FarmerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NearbyFarmerRepository extends JpaRepository<FarmerProfile, Long> {

    @Query(value = "SELECT p.id, " +
            "(6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(p.latitude)))) AS distance " +
            "FROM farmer_profiles p " +
            "JOIN users u ON p.user_id = u.id " +
            "WHERE p.latitude IS NOT NULL AND p.longitude IS NOT NULL " +
            "AND p.approval_status = 'APPROVED' AND u.status = 'ACTIVE' " +
            "HAVING distance <= :radius " +
            "ORDER BY distance ASC " +
            "LIMIT 50", nativeQuery = true)
    List<Object[]> findNearbyFarmerIdsNative(@Param("lat") double lat, @Param("lng") double lng, @Param("radius") double radius);
}
