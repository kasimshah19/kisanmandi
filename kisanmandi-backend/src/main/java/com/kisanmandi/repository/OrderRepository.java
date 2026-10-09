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

    long countByFarmerIdAndStatus(Long farmerId, OrderStatus status);
}
