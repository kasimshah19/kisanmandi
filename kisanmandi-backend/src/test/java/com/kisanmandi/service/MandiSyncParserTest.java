package com.kisanmandi.service;

import com.kisanmandi.dto.mandi.MandiApiRecord;
import com.kisanmandi.entity.MandiPrice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class MandiSyncParserTest {

    private MandiSyncService syncService;

    @BeforeEach
    void setUp() {
        syncService = new MandiSyncService(null, null, null, null);
    }

    @Test
    void parseRecord_validRecord_success() {
        MandiApiRecord record = new MandiApiRecord();
        record.setState("Maharashtra");
        record.setDistrict("Dhule");
        record.setMarket("Dhule Mandi");
        record.setCommodity("Onion");
        record.setVariety("Red");
        record.setGrade("FAQ");
        record.setArrivalDate("12/10/2026");
        record.setMinPrice("1500");
        record.setMaxPrice("2500");
        record.setModalPrice("2000");

        MandiPrice price = syncService.parseRecord(record);

        assertNotNull(price);
        assertEquals("Maharashtra", price.getState());
        assertEquals(LocalDate.of(2026, 10, 12), price.getPriceDate());
        assertEquals(new BigDecimal("2000"), price.getModalPrice());
    }

    @Test
    void parseRecord_naPriceHandled_modalNullSkipsRecord() {
        MandiApiRecord record = new MandiApiRecord();
        record.setState("Maharashtra");
        record.setDistrict("Dhule");
        record.setMarket("Dhule Mandi");
        record.setCommodity("Onion");
        record.setArrivalDate("12/10/2026");
        record.setMinPrice("NA");
        record.setMaxPrice("2500");
        record.setModalPrice("NA"); // NA modal price should cause record to be skipped

        MandiPrice price = syncService.parseRecord(record);
        assertNull(price);
    }

    @Test
    void parseRecord_badDate_skipped() {
        MandiApiRecord record = new MandiApiRecord();
        record.setState("Maharashtra");
        record.setArrivalDate("invalid-date-string");
        record.setModalPrice("2000");

        MandiPrice price = syncService.parseRecord(record);
        assertNull(price);
    }

    @Test
    void parseRecord_modalLessOrEqualZero_skipped() {
        MandiApiRecord zeroRecord = new MandiApiRecord();
        zeroRecord.setState("Maharashtra");
        zeroRecord.setArrivalDate("12/10/2026");
        zeroRecord.setModalPrice("0");
        assertNull(syncService.parseRecord(zeroRecord));

        MandiApiRecord negativeRecord = new MandiApiRecord();
        negativeRecord.setState("Maharashtra");
        negativeRecord.setArrivalDate("12/10/2026");
        negativeRecord.setModalPrice("-500");
        assertNull(syncService.parseRecord(negativeRecord));
    }
}
