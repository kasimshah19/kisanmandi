package com.kisanmandi.service;

import com.kisanmandi.dto.NearbyFarmerResponse;
import com.kisanmandi.dto.PublicFarmerResponse;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.repository.NearbyFarmerRepository;
import com.kisanmandi.repository.FarmerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NearbyService {

    private final NearbyFarmerRepository nearbyFarmerRepository;
    private final FarmerProfileRepository farmerProfileRepository;

    public record BoundingBox(double minLat, double maxLat, double minLng, double maxLng) {}

    // Bounding-box math with pole guard protection
    public BoundingBox calculateBoundingBox(double lat, double lng, double radiusKm) {
        if (lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (lng < -180.0 || lng > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (radiusKm <= 0 || radiusKm > 1000.0) {
            throw new IllegalArgumentException("Radius must be greater than 0 and up to 1000 km");
        }

        // Earth radius ~6371 km -> 1 deg lat ~ 111.19 km
        double latDelta = radiusKm / 111.19;
        double minLat = Math.max(-90.0, lat - latDelta);
        double maxLat = Math.min(90.0, lat + latDelta);

        // Pole guard: near the poles (>= 89 deg), longitudes converge, cover full range
        double minLng;
        double maxLng;
        if (Math.abs(lat) >= 89.0 || Math.abs(minLat) >= 89.0 || Math.abs(maxLat) >= 89.0) {
            minLng = -180.0;
            maxLng = 180.0;
        } else {
            double lngDelta = radiusKm / (111.19 * Math.cos(Math.toRadians(lat)));
            minLng = Math.max(-180.0, lng - lngDelta);
            maxLng = Math.min(180.0, lng + lngDelta);
        }

        return new BoundingBox(minLat, maxLat, minLng, maxLng);
    }

    @Transactional(readOnly = true)
    public List<NearbyFarmerResponse> findNearbyFarmers(double lat, double lng, double radiusKm) {
        if (lat < -90.0 || lat > 90.0) {
            throw new IllegalArgumentException("Latitude must be between -90 and 90");
        }
        if (lng < -180.0 || lng > 180.0) {
            throw new IllegalArgumentException("Longitude must be between -180 and 180");
        }
        if (radiusKm <= 0 || radiusKm > 1000.0) {
            throw new IllegalArgumentException("Radius must be greater than 0 and up to 1000 km");
        }

        List<Object[]> results = nearbyFarmerRepository.findNearbyFarmerIdsNative(lat, lng, radiusKm);
        List<NearbyFarmerResponse> responseList = new ArrayList<>();

        for (Object[] row : results) {
            Long profileId = ((Number) row[0]).longValue();
            double distance = ((Number) row[1]).doubleValue();

            Optional<FarmerProfile> profileOpt = farmerProfileRepository.findById(profileId);
            if (profileOpt.isPresent()) {
                FarmerProfile profile = profileOpt.get();
                PublicFarmerResponse pfr = PublicFarmerResponse.builder()
                        .id(profile.getUser().getId())
                        .name(profile.getUser().getName())
                        .farmName(profile.getFarmName())
                        .village(profile.getVillage())
                        .district(profile.getDistrict())
                        .state(profile.getState())
                        .ratingAvg(profile.getRatingAvg())
                        .ratingCount(profile.getRatingCount())
                        .joinedAt(profile.getUser().getCreatedAt())
                        .build();

                responseList.add(NearbyFarmerResponse.builder()
                        .farmer(pfr)
                        .distanceKm(Math.round(distance * 10.0) / 10.0) // Round to 1 decimal place
                        .build());
            }
        }
        return responseList;
    }
}
