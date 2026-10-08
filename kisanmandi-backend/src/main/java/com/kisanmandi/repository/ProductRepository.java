package com.kisanmandi.repository;

import com.kisanmandi.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("SELECT p FROM Product p JOIN FETCH p.farmer f JOIN FETCH p.category c WHERE p.farmer.id = :farmerId AND p.deleted = false ORDER BY p.createdAt DESC")
    List<Product> findByFarmerIdAndDeletedFalse(@Param("farmerId") Long farmerId);

    @Query(value = "SELECT p FROM Product p JOIN FETCH p.farmer f JOIN FETCH p.category c " +
            "JOIN FarmerProfile fp ON fp.user.id = f.id " +
            "WHERE p.active = true AND p.deleted = false " +
            "AND c.active = true AND fp.approvalStatus = 'APPROVED' " +
            "AND (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')))",
           countQuery = "SELECT COUNT(p) FROM Product p " +
            "JOIN FarmerProfile fp ON fp.user.id = p.farmer.id " +
            "WHERE p.active = true AND p.deleted = false " +
            "AND p.category.active = true AND fp.approvalStatus = 'APPROVED' " +
            "AND (:categoryId IS NULL OR p.category.id = :categoryId) " +
            "AND (:q IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Product> searchPublicProducts(@Param("categoryId") Long categoryId, @Param("q") String q, Pageable pageable);

    @Query("SELECT p FROM Product p JOIN FETCH p.farmer f JOIN FETCH p.category c " +
            "JOIN FarmerProfile fp ON fp.user.id = f.id " +
            "WHERE p.id = :id AND p.active = true AND p.deleted = false " +
            "AND c.active = true AND fp.approvalStatus = 'APPROVED'")
    Optional<Product> findPublicById(@Param("id") Long id);
}
