package com.kisanmandi.service;

import com.kisanmandi.entity.MandiPrice;
import com.kisanmandi.entity.PriceSource;
import com.kisanmandi.repository.MandiPriceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class MandiDemoSeeder {

    private static final Logger log = LoggerFactory.getLogger(MandiDemoSeeder.class);
    
    private final MandiPriceRepository repository;
    
    @Value("${mandi.demo-seed.enabled:false}")
    private boolean demoSeedEnabled;

    public MandiDemoSeeder(MandiPriceRepository repository) {
        this.repository = repository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDemoData() {
        if (!demoSeedEnabled) {
            log.info("Demo seeder disabled. Clearing existing mock data...");
            repository.deleteAll();
            return;
        }

        long distinctRealDates = repository.countDistinctDatesBySource(PriceSource.API);
        if (distinctRealDates >= 3) {
            log.info("Demo seeder skipped: Real data exists for {} dates.", distinctRealDates);
            return;
        }

        LocalDate latestRealDate = repository.findLatestPriceDate().orElse(null);
        List<MandiPrice> basePrices;
        
        if (latestRealDate == null) {
            log.warn("Demo seeder: No real data to base on. Creating synthetic base data for testing.");
            latestRealDate = LocalDate.now();
            basePrices = createSyntheticBasePrices(latestRealDate);
        } else {
            basePrices = repository.findBySourceAndPriceDate(PriceSource.API, latestRealDate);
        }

        if (basePrices.isEmpty()) {
            return;
        }

        log.info("GENERATING DEMO DATA (dev only) for 14 days backwards from {}", latestRealDate);
        Random random = new Random();
        List<MandiPrice> toSave = new ArrayList<>(basePrices); // Also save the base prices if they were synthetic

        for (int i = 1; i <= 14; i++) {
            LocalDate targetDate = latestRealDate.minusDays(i);
            if (repository.existsByPriceDate(targetDate)) {
                continue;
            }

            for (MandiPrice base : basePrices) {
                MandiPrice demo = new MandiPrice();
                demo.setState(base.getState());
                demo.setDistrict(base.getDistrict());
                demo.setMarket(base.getMarket());
                demo.setCommodity(base.getCommodity());
                demo.setVariety(base.getVariety());
                demo.setGrade(base.getGrade());
                demo.setPriceDate(targetDate);
                demo.setSource(PriceSource.DEMO);

                double factor = 0.92 + (0.16 * random.nextDouble());
                BigDecimal newModal = base.getModalPrice().multiply(BigDecimal.valueOf(factor))
                        .setScale(2, RoundingMode.HALF_UP);
                
                // Ensure min < modal < max roughly
                BigDecimal newMin = newModal.multiply(BigDecimal.valueOf(0.9)).setScale(2, RoundingMode.HALF_UP);
                BigDecimal newMax = newModal.multiply(BigDecimal.valueOf(1.1)).setScale(2, RoundingMode.HALF_UP);

                demo.setMinPrice(newMin);
                demo.setMaxPrice(newMax);
                demo.setModalPrice(newModal);
                demo.normalize();
                
                toSave.add(demo);
            }
        }

        if (!toSave.isEmpty()) {
            // Batch save to avoid huge memory spike, doing simple list save for demo
            repository.saveAll(toSave);
            log.info("DEMO DATA GENERATED (dev only) - Saved {} demo records.", toSave.size());
        }
    }

    private List<MandiPrice> createSyntheticBasePrices(LocalDate date) {
        List<MandiPrice> list = new ArrayList<>();
        String[] commodities = {"Tomato", "Onion", "Potato", "Wheat", "Soyabean", "Cotton"};
        String[] markets = {"Pune", "Mumbai", "Nagpur", "Nashik"};
        Random random = new Random();

        for (String comm : commodities) {
            for (String mkt : markets) {
                MandiPrice mp = new MandiPrice();
                mp.setState("Maharashtra");
                mp.setDistrict(mkt); // Simplify district = market for mock
                mp.setMarket(mkt);
                mp.setCommodity(comm);
                mp.setVariety("Other");
                mp.setGrade("FAQ");
                mp.setPriceDate(date);
                mp.setSource(PriceSource.DEMO);
                
                double baseVal = 2000 + random.nextInt(3000);
                if (comm.equals("Tomato")) baseVal = 1500 + random.nextInt(2000);
                if (comm.equals("Onion")) baseVal = 2500 + random.nextInt(1500);
                
                mp.setModalPrice(BigDecimal.valueOf(baseVal));
                mp.setMinPrice(BigDecimal.valueOf(baseVal * 0.9).setScale(2, RoundingMode.HALF_UP));
                mp.setMaxPrice(BigDecimal.valueOf(baseVal * 1.1).setScale(2, RoundingMode.HALF_UP));
                list.add(mp);
            }
        }
        return list;
    }
}
