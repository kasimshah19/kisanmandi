package com.kisanmandi.repository;

import com.kisanmandi.entity.Payment;
import com.kisanmandi.entity.PaymentRecordStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByPaymentGroupId(String paymentGroupId);

    @Query("SELECT p FROM Payment p WHERE p.paymentGroupId = :paymentGroupId AND p.customer.id = :customerId")
    Optional<Payment> findByPaymentGroupIdAndCustomerId(@Param("paymentGroupId") String paymentGroupId, @Param("customerId") Long customerId);

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    List<Payment> findByStatusAndExpiresAtBefore(PaymentRecordStatus status, LocalDateTime threshold);
}
