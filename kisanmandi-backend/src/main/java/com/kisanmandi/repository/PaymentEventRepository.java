package com.kisanmandi.repository;

import com.kisanmandi.entity.PaymentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentEventRepository extends JpaRepository<PaymentEvent, Long> {

    boolean existsByEventId(String eventId);

    Optional<PaymentEvent> findByEventId(String eventId);
}

