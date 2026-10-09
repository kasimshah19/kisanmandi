package com.kisanmandi.service;

import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.repository.MandiPriceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class MandiPersistenceService {

    private final MandiPriceRepository repository;

    public MandiPersistenceService(MandiPriceRepository repository) {
        this.repository = repository;
    }

    public static class BatchResult {
        public int inserted = 0;
        public int updated = 0;
    }

    @Transactional
    public BatchResult saveBatch(String state, LocalDate priceDate, List<MandiPrice> parsedPrices) {
        BatchResult result = new BatchResult();
        if (parsedPrices == null || parsedPrices.isEmpty()) return result;

        // Fetch existing records for this state and date
        List<MandiPrice> existing = repository.findByStateAndPriceDate(state, priceDate);
        Map<String, MandiPrice> existingMap = existing.stream()
                .collect(Collectors.toMap(this::generateUniqueKey, Function.identity(), (a, b) -> a));

        List<MandiPrice> toSave = new ArrayList<>();

        for (MandiPrice p : parsedPrices) {
            String key = generateUniqueKey(p);
            MandiPrice ext = existingMap.get(key);
            if (ext != null) {
                // Update if prices changed
                if (priceChanged(ext, p)) {
                    ext.setMinPrice(p.getMinPrice());
                    ext.setMaxPrice(p.getMaxPrice());
                    ext.setModalPrice(p.getModalPrice());
                    toSave.add(ext);
                    result.updated++;
                }
            } else {
                // Insert new
                toSave.add(p);
                result.inserted++;
                // Add to map to prevent duplicates within the same batch
                existingMap.put(key, p);
            }
        }

        if (!toSave.isEmpty()) {
            repository.saveAll(toSave);
        }

        return result;
    }

    private String generateUniqueKey(MandiPrice m) {
        return String.format("%s|%s|%s|%s|%s|%s",
                m.getState(), m.getDistrict(), m.getMarket(),
                m.getCommodity(), m.getVariety(), m.getGrade());
    }

    private boolean priceChanged(MandiPrice a, MandiPrice b) {
        return compare(a.getMinPrice(), b.getMinPrice()) != 0 ||
               compare(a.getMaxPrice(), b.getMaxPrice()) != 0 ||
               compare(a.getModalPrice(), b.getModalPrice()) != 0;
    }

    private int compare(java.math.BigDecimal b1, java.math.BigDecimal b2) {
        if (b1 == null && b2 == null) return 0;
        if (b1 == null) return -1;
        if (b2 == null) return 1;
        return b1.compareTo(b2);
    }
}
