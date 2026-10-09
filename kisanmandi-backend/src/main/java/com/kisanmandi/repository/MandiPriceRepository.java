package com.kisanmandi.repository;

import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.entity.PriceSource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MandiPriceRepository extends JpaRepository<MandiPrice, Long> {

    @Query("SELECT DISTINCT m.state FROM MandiPrice m ORDER BY m.state")
    List<String> findDistinctStates();

    @Query("SELECT DISTINCT m.district FROM MandiPrice m WHERE m.state = :state ORDER BY m.district")
    List<String> findDistinctDistricts(@Param("state") String state);

    @Query("SELECT DISTINCT m.market FROM MandiPrice m WHERE m.state = :state AND m.district = :district ORDER BY m.market")
    List<String> findDistinctMarkets(@Param("state") String state, @Param("district") String district);

    @Query("SELECT DISTINCT m.commodity FROM MandiPrice m WHERE " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) AND " +
           "(:market IS NULL OR m.market = :market) " +
           "ORDER BY m.commodity")
    List<String> findDistinctCommodities(@Param("state") String state, @Param("district") String district, @Param("market") String market);

    @Query("SELECT MAX(m.priceDate) FROM MandiPrice m")
    Optional<LocalDate> findLatestPriceDate();

    @Query("SELECT MAX(m.priceDate) FROM MandiPrice m WHERE m.commodity = :commodity")
    Optional<LocalDate> findLatestPriceDateByCommodity(@Param("commodity") String commodity);

    List<MandiPrice> findByStateAndPriceDate(String state, LocalDate priceDate);

    @Query("SELECT m FROM MandiPrice m WHERE " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) AND " +
           "(:market IS NULL OR m.market = :market) AND " +
           "(:commodity IS NULL OR m.commodity = :commodity) AND " +
           "(:priceDate IS NULL OR m.priceDate = :priceDate)")
    Page<MandiPrice> findPrices(
            @Param("state") String state,
            @Param("district") String district,
            @Param("market") String market,
            @Param("commodity") String commodity,
            @Param("priceDate") LocalDate priceDate,
            Pageable pageable);

    @Modifying
    @Query("DELETE FROM MandiPrice m WHERE m.priceDate < :cutoffDate")
    int deleteByPriceDateBefore(@Param("cutoffDate") LocalDate cutoffDate);

    @Query("SELECT new com.kisanmandi.dto.mandi.TrendPoint(m.priceDate, AVG(m.modalPrice), MIN(m.minPrice), MAX(m.maxPrice), COUNT(DISTINCT m.market)) " +
           "FROM MandiPrice m WHERE m.commodity = :commodity AND " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) AND " +
           "(:market IS NULL OR m.market = :market) AND " +
           "m.priceDate >= :startDate AND m.priceDate <= :endDate " +
           "GROUP BY m.priceDate ORDER BY m.priceDate ASC")
    List<com.kisanmandi.dto.mandi.TrendPoint> getTrend(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("district") String district,
            @Param("market") String market,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT new com.kisanmandi.dto.mandi.ComparePoint(m.market, m.district, m.modalPrice, m.minPrice, m.maxPrice) " +
           "FROM MandiPrice m WHERE m.commodity = :commodity AND m.priceDate = :priceDate AND " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) " +
           "ORDER BY m.modalPrice DESC")
    List<com.kisanmandi.dto.mandi.ComparePoint> getCompare(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("district") String district,
            @Param("priceDate") LocalDate priceDate,
            Pageable pageable);

    @Query("SELECT new com.kisanmandi.dto.mandi.TrendPoint(m.priceDate, AVG(m.modalPrice), MIN(m.minPrice), MAX(m.maxPrice), COUNT(DISTINCT m.market)) " +
           "FROM MandiPrice m WHERE m.commodity = :commodity AND " +
           "(:state IS NULL OR m.state = :state) AND " +
           "(:district IS NULL OR m.district = :district) AND " +
           "m.priceDate = :priceDate " +
           "GROUP BY m.priceDate")
    Optional<com.kisanmandi.dto.mandi.TrendPoint> getSummary(
            @Param("commodity") String commodity,
            @Param("state") String state,
            @Param("district") String district,
            @Param("priceDate") LocalDate priceDate);

    @Query("SELECT DISTINCT m.commodity FROM MandiPrice m WHERE LOWER(m.commodity) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<String> searchCommoditiesFuzzy(@Param("query") String query);

    @Query("SELECT m.commodity FROM MandiPrice m WHERE LOWER(m.commodity) = LOWER(:query)")
    List<String> findCommodityExact(@Param("query") String query);

    boolean existsByPriceDate(LocalDate priceDate);

    long countBySource(PriceSource source);

    @Query("SELECT COUNT(DISTINCT m.priceDate) FROM MandiPrice m WHERE m.source = :source")
    long countDistinctDatesBySource(@Param("source") PriceSource source);

    List<MandiPrice> findBySourceAndPriceDate(PriceSource source, LocalDate priceDate);
}
