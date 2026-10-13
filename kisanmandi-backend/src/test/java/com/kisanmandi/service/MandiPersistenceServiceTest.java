package com.kisanmandi.service;

import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.repository.MandiPriceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MandiPersistenceServiceTest {

    @Mock
    private MandiPriceRepository repository;

    @InjectMocks
    private MandiPersistenceService persistenceService;

    private LocalDate testDate;

    @BeforeEach
    void setUp() {
        testDate = LocalDate.of(2026, 10, 12);
    }

    private MandiPrice createPrice(String commodity, String modalPrice) {
        MandiPrice p = new MandiPrice();
        p.setState("Maharashtra");
        p.setDistrict("Dhule");
        p.setMarket("Dhule Mandi");
        p.setCommodity(commodity);
        p.setVariety("Common");
        p.setGrade("FAQ");
        p.setPriceDate(testDate);
        p.setMinPrice(new BigDecimal("1000"));
        p.setMaxPrice(new BigDecimal("2000"));
        p.setModalPrice(new BigDecimal(modalPrice));
        return p;
    }

    @Test
    void saveBatch_insertsNewRecords() {
        when(repository.findByStateAndPriceDate("Maharashtra", testDate))
                .thenReturn(Collections.emptyList());

        List<MandiPrice> batch = List.of(createPrice("Tomato", "1500"));

        MandiPersistenceService.BatchResult result = persistenceService.saveBatch("Maharashtra", testDate, batch);

        assertEquals(1, result.inserted);
        assertEquals(0, result.updated);
        verify(repository).saveAll(any());
    }

    @Test
    void saveBatch_updatesExistingWhenPriceChanged() {
        MandiPrice existing = createPrice("Tomato", "1500");
        when(repository.findByStateAndPriceDate("Maharashtra", testDate))
                .thenReturn(new ArrayList<>(List.of(existing)));

        // New batch has same commodity/market but modal price is updated to 1800
        MandiPrice incoming = createPrice("Tomato", "1800");

        MandiPersistenceService.BatchResult result = persistenceService.saveBatch("Maharashtra", testDate, List.of(incoming));

        assertEquals(0, result.inserted);
        assertEquals(1, result.updated);
        assertEquals(new BigDecimal("1800"), existing.getModalPrice());
        verify(repository).saveAll(any());
    }

    @Test
    void saveBatch_idempotentWhenSamePrice() {
        MandiPrice existing = createPrice("Tomato", "1500");
        when(repository.findByStateAndPriceDate("Maharashtra", testDate))
                .thenReturn(new ArrayList<>(List.of(existing)));

        // Incoming is identical
        MandiPrice incoming = createPrice("Tomato", "1500");

        MandiPersistenceService.BatchResult result = persistenceService.saveBatch("Maharashtra", testDate, List.of(incoming));

        assertEquals(0, result.inserted);
        assertEquals(0, result.updated);
        verify(repository, never()).saveAll(any());
    }
}
