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

    @Transactional(readOnly = true)
    public List<NearbyFarmerResponse> findNearbyFarmers(double lat, double lng, double radiusKm) {
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
