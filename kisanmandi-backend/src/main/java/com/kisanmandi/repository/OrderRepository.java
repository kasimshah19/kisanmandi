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

    @EntityGraph(attributePaths = {"customer", "customer.profile", "farmer", "farmer.profile"})
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "customer.profile", "farmer", "farmer.profile"})
    Page<Order> findByFarmerId(Long farmerId, Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "customer.profile", "farmer", "farmer.profile"})
    Page<Order> findByFarmerIdAndStatus(Long farmerId, OrderStatus status, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"customer", "customer.profile", "farmer", "farmer.profile"})
    @org.springframework.lang.NonNull
    Page<Order> findAll(@org.springframework.lang.NonNull Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT o FROM Order o JOIN FETCH o.customer c LEFT JOIN FETCH c.profile cp JOIN FETCH o.farmer f LEFT JOIN FETCH f.profile fp ORDER BY o.createdAt DESC",
           countQuery = "SELECT COUNT(o) FROM Order o")
    Page<Order> findAllForAdmin(Pageable pageable);

    @EntityGraph(attributePaths = {"items", "customer", "farmer"})
    Optional<Order> findWithItemsAndHistoryById(Long id);

    long countByFarmerId(Long farmerId);

    long countByFarmerIdAndStatus(Long farmerId, OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.farmer.id = :farmerId AND o.status = :status")
    java.math.BigDecimal sumTotalAmountByFarmerIdAndStatus(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, @org.springframework.data.repository.query.Param("status") OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status")
    java.math.BigDecimal sumTotalAmountByStatus(@org.springframework.data.repository.query.Param("status") OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.farmer.id = :farmerId AND o.status IN ('PLACED', 'ACCEPTED', 'PACKED', 'OUT_FOR_DELIVERY')")
    java.math.BigDecimal sumPendingAmountByFarmerId(@org.springframework.data.repository.query.Param("farmerId") Long farmerId);

    java.util.List<Order> findByFarmerIdAndStatus(Long farmerId, OrderStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    java.util.List<Object[]> countOrdersByStatus();

    long countByCreatedAtAfter(java.time.LocalDateTime after);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = :status AND o.createdAt >= :after")
    java.math.BigDecimal sumTotalAmountByStatusAndCreatedAtAfter(@org.springframework.data.repository.query.Param("status") OrderStatus status, @org.springframework.data.repository.query.Param("after") java.time.LocalDateTime after);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.farmer.id = :farmerId AND o.status = :status AND o.createdAt >= :after")
    java.math.BigDecimal sumFarmerTotalAmountByStatusAndCreatedAtAfter(@org.springframework.data.repository.query.Param("farmerId") Long farmerId, @org.springframework.data.repository.query.Param("status") OrderStatus status, @org.springframework.data.repository.query.Param("after") java.time.LocalDateTime after);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Order o SET o.status = :targetStatus WHERE o.id = :orderId AND o.status = :expectedStatus")
    int updateStatusIfCurrentStatus(@org.springframework.data.repository.query.Param("orderId") Long orderId, 
                                   @org.springframework.data.repository.query.Param("expectedStatus") OrderStatus expectedStatus, 
                                   @org.springframework.data.repository.query.Param("targetStatus") OrderStatus targetStatus);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE Order o SET o.status = :targetStatus WHERE o.id = :orderId AND o.status IN (:allowedStatuses)")
    int updateStatusIfCurrentStatusIn(@org.springframework.data.repository.query.Param("orderId") Long orderId, 
                                     @org.springframework.data.repository.query.Param("allowedStatuses") java.util.Collection<OrderStatus> allowedStatuses, 
                                     @org.springframework.data.repository.query.Param("targetStatus") OrderStatus targetStatus);
}
