package com.kisanmandi.repository;

import com.kisanmandi.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByOrderId(Long orderId);

    @Query("SELECT r FROM Review r WHERE r.farmer.id = :farmerId AND r.hidden = false ORDER BY r.createdAt DESC")
    Page<Review> findPublicByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.farmer.id = :farmerId ORDER BY r.createdAt DESC")
    Page<Review> findByFarmerId(@Param("farmerId") Long farmerId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE (:hidden IS NULL OR r.hidden = :hidden) AND (:rating IS NULL OR r.rating = :rating) AND (:farmerId IS NULL OR r.farmer.id = :farmerId) ORDER BY r.createdAt DESC")
    Page<Review> findAllForAdmin(@Param("hidden") Boolean hidden, @Param("rating") Integer rating, @Param("farmerId") Long farmerId, Pageable pageable);
    
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.farmer.id = :farmerId AND r.hidden = false GROUP BY r.rating")
    List<Object[]> getRatingDistributionForFarmer(@Param("farmerId") Long farmerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.farmer.id = :farmerId AND r.hidden = false")
    Optional<Double> getAverageRatingForFarmer(@Param("farmerId") Long farmerId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.farmer.id = :farmerId AND r.hidden = false")
    int countVisibleReviewsForFarmer(@Param("farmerId") Long farmerId);
}
