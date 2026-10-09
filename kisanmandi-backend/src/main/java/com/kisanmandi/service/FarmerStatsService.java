package com.kisanmandi.service;

import com.kisanmandi.dto.FarmerStatsResponse;
import com.kisanmandi.entity.OrderStatus;
import com.kisanmandi.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FarmerStatsService {

    private final OrderRepository orderRepository;

    @Transactional(readOnly = true)
    public FarmerStatsResponse getStats(Long farmerId) {
        long totalOrders = orderRepository.countByFarmerId(farmerId);
        
        long pendingOrders = orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.PLACED);
        long completedOrders = orderRepository.countByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);
        
        BigDecimal earnings = orderRepository.sumTotalAmountByFarmerIdAndStatus(farmerId, OrderStatus.DELIVERED);
        if (earnings == null) {
            earnings = BigDecimal.ZERO;
        }

        return FarmerStatsResponse.builder()
                .totalEarnings(earnings)
                .totalOrders(totalOrders)
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .build();
    }
}
