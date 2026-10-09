package com.kisanmandi.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = true) // nullable just in case product is hard deleted eventually, though soft delete is used
    private Product product;

    // Snapshot fields
    @Column(nullable = false, length = 200)
    private String productName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductUnit unit;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAtOrder;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
}
