package com.kisanmandi.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "mandi_prices", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"state", "district", "market", "commodity", "variety", "grade", "price_date"})
    },
    indexes = {
        @Index(name = "idx_commodity_date", columnList = "commodity, price_date"),
        @Index(name = "idx_state_dist_market", columnList = "state, district, market"),
        @Index(name = "idx_price_date", columnList = "price_date")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MandiPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 50, nullable = false)
    private String state;

    @Column(length = 60, nullable = false)
    private String district;

    @Column(length = 100, nullable = false)
    private String market;

    @Column(length = 80, nullable = false)
    private String commodity;

    @Column(length = 80, nullable = false)
    private String variety;

    @Column(length = 30, nullable = false)
    private String grade;

    @Column(precision = 10, scale = 2)
    private BigDecimal minPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal maxPrice;

    @Column(precision = 10, scale = 2)
    private BigDecimal modalPrice;

    @Column(name = "price_date", nullable = false)
    private LocalDate priceDate;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private PriceSource source = PriceSource.API;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void normalize() {
        this.state = trimOrEmpty(this.state);
        this.district = trimOrEmpty(this.district);
        this.market = trimOrEmpty(this.market);
        this.commodity = trimOrEmpty(this.commodity);
        
        String v = trimOrEmpty(this.variety);
        this.variety = v.isEmpty() ? "Other" : v;
        
        String g = trimOrEmpty(this.grade);
        this.grade = g.isEmpty() ? "Other" : g;
    }

    private String trimOrEmpty(String val) {
        return val == null ? "" : val.trim();
    }
}
