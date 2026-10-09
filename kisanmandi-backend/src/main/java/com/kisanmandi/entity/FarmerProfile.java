package com.kisanmandi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "farmer_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(nullable = false)
    private String farmName;

    @Column(nullable = false)
    private String village;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String state;

    @Column(nullable = false, length = 6)
    private String pincode;

    private Double latitude;
    private Double longitude;

    // Private document info on Cloudinary
    private String documentPublicId;
    private String documentResourceType;
    private String documentFormat;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus;

    @Column(length = 300)
    private String rejectionReason;

    @CreationTimestamp
    private LocalDateTime submittedAt;

    private LocalDateTime reviewedAt;
    @Builder.Default
    @Column(precision = 3, scale = 2, nullable = false, columnDefinition = "decimal(3,2) default 0.00")
    private java.math.BigDecimal ratingAvg = java.math.BigDecimal.ZERO;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "int default 0")
    private int ratingCount = 0;
}
