package com.kisanmandi.repository;

import com.kisanmandi.entity.Order;
import com.kisanmandi.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    Page<Order> findByFarmerId(Long farmerId, Pageable pageable);

    Page<Order> findByFarmerIdAndStatus(Long farmerId, OrderStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"items", "customer", "farmer"})
    Optional<Order> findWithItemsAndHistoryById(Long id);

    long countByFarmerId(Long farmerId);

    long countByFarmerIdAndStatus(Long farmerId, OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.farmer.id = :farmerId AND o.status = :status")
    java.math.BigDecimal sumTotalAmountByFarmerIdAndStatus(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, @org.springframework.data.repository.query.Param("status") OrderStatus status);
}
