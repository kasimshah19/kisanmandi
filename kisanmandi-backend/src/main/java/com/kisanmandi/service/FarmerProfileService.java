package com.kisanmandi.service;

import com.kisanmandi.dto.FarmerProfileRequest;
import com.kisanmandi.dto.FarmerProfileResponse;
import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import com.kisanmandi.entity.User;
import com.kisanmandi.exception.ResourceNotFoundException;
import com.kisanmandi.repository.FarmerProfileRepository;
import com.kisanmandi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FarmerProfileService {

    private final FarmerProfileRepository farmerProfileRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional(readOnly = true)
    public FarmerProfileResponse getMyProfile(Long userId) {
        Optional<FarmerProfile> profileOpt = farmerProfileRepository.findByUserId(userId);
        if (profileOpt.isEmpty()) {
            return FarmerProfileResponse.builder()
                    .approvalStatus("NOT_SUBMITTED")
                    .build();
        }
        return mapToResponse(profileOpt.get());
    }

    @Transactional
    public FarmerProfileResponse saveProfile(Long userId, FarmerProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElse(FarmerProfile.builder()
                        .user(user)
                        .build());

        profile.setFarmName(request.getFarmName());
        profile.setVillage(request.getVillage());
        profile.setDistrict(request.getDistrict());
        profile.setState(request.getState());
        profile.setPincode(request.getPincode());
        profile.setLatitude(request.getLatitude());
        profile.setLongitude(request.getLongitude());

        // Any edit makes it PENDING again
        profile.setApprovalStatus(ApprovalStatus.PENDING);
        profile.setRejectionReason(null);
        profile.setSubmittedAt(java.time.LocalDateTime.now());
        // Do not clear reviewedAt, it's just history

        profile = farmerProfileRepository.save(profile);
        return mapToResponse(profile);
    }

    @Transactional
    public FarmerProfileResponse uploadDocument(Long userId, MultipartFile file) {
        FarmerProfile profile = farmerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Please save your profile details first before uploading a document"));

        // Delete old document from Cloudinary if exists
        if (profile.getDocumentPublicId() != null) {
            cloudinaryService.delete(profile.getDocumentPublicId(), profile.getDocumentResourceType());
        }

        Map<String, Object> uploadResult = cloudinaryService.uploadFarmerDocument(file);
        
        profile.setDocumentPublicId((String) uploadResult.get("public_id"));
        profile.setDocumentResourceType((String) uploadResult.get("resource_type"));
        profile.setDocumentFormat((String) uploadResult.get("format"));
        
        // If it was rejected, uploading a new document sets it back to pending
        if (profile.getApprovalStatus() == ApprovalStatus.REJECTED) {
            profile.setApprovalStatus(ApprovalStatus.PENDING);
            profile.setRejectionReason(null);
            profile.setSubmittedAt(java.time.LocalDateTime.now());
        }

        profile = farmerProfileRepository.save(profile);
        return mapToResponse(profile);
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
