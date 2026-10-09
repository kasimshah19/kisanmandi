package com.kisanmandi.service;

import com.kisanmandi.dto.FarmerProfileResponse;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.FarmerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class AdminFarmerService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public List<FarmerProfileResponse> listFarmers(ApprovalStatus status) {
        List<FarmerProfile> profiles;
        if (status != null) {
            profiles = farmerProfileRepository.findByApprovalStatusOrderBySubmittedAtAsc(status);
        } else {
            profiles = farmerProfileRepository.findAll();
        }
        return profiles.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmerProfileResponse getFarmer(Long profileId) {
        FarmerProfile profile = farmerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        return mapToResponse(profile);
    }

    @Transactional
    public void approve(Long profileId) {
        FarmerProfile profile = farmerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        
        profile.setApprovalStatus(ApprovalStatus.APPROVED);
        profile.setReviewedAt(LocalDateTime.now());
        profile.setRejectionReason(null);
        farmerProfileRepository.save(profile);
    }

    @Transactional
    public void reject(Long profileId, String reason) {
        FarmerProfile profile = farmerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        
        profile.setApprovalStatus(ApprovalStatus.REJECTED);
        profile.setReviewedAt(LocalDateTime.now());
        profile.setRejectionReason(reason);
        farmerProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public Map<String, String> getDocumentUrl(Long profileId) {
        FarmerProfile profile = farmerProfileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer profile not found"));
        
        if (profile.getDocumentPublicId() == null) {
            throw new ResourceNotFoundException("No document uploaded");
        }
        
        String signedUrl = cloudinaryService.generateSignedDocumentUrl(
                profile.getDocumentPublicId(),
                profile.getDocumentResourceType(),
                profile.getDocumentFormat()
        );
        
        return Map.of("url", signedUrl);
    }

    private FarmerProfileResponse mapToResponse(FarmerProfile profile) {
        return FarmerProfileResponse.builder()
                .id(profile.getId())
                .farmerId(profile.getUser().getId())
                .farmerName(profile.getUser().getName())
                .farmerEmail(profile.getUser().getEmail())
                .farmerPhone(profile.getUser().getPhone())
                .farmName(profile.getFarmName())
                .village(profile.getVillage())
                .district(profile.getDistrict())
                .state(profile.getState())
                .pincode(profile.getPincode())
                .latitude(profile.getLatitude())
                .longitude(profile.getLongitude())
                .hasDocument(profile.getDocumentPublicId() != null)
                .approvalStatus(profile.getApprovalStatus().name())
                .rejectionReason(profile.getRejectionReason())
                .submittedAt(profile.getSubmittedAt())
                .reviewedAt(profile.getReviewedAt())
                .build();
    }
}
