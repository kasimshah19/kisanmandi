package com.kisanmandi.repository;

import com.kisanmandi.entity.ApprovalStatus;
import com.kisanmandi.entity.FarmerProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FarmerProfileRepository extends JpaRepository<FarmerProfile, Long> {
    Optional<FarmerProfile> findByUserId(Long userId);
    List<FarmerProfile> findByApprovalStatusOrderBySubmittedAtAsc(ApprovalStatus approvalStatus);
    boolean existsByUserIdAndApprovalStatus(Long userId, ApprovalStatus approvalStatus);
}
