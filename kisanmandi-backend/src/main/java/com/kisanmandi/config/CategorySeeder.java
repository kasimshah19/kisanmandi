package com.kisanmandi.config;

import com.kisanmandi.entity.Category;
import com.kisanmandi.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class CategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private static final Logger log = LoggerFactory.getLogger(CategorySeeder.class);

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = Arrays.asList(
                    "Sabzi", "Fal", "Anaaj", "Dal", "Dudh aur Dairy", "Masale", "Other"
            );
            
            for (String catName : defaultCategories) {
                Category category = Category.builder()
                        .name(catName)
                        .active(true)
                        .build();
                categoryRepository.save(category);
            }
            log.info("? Seeded {} default categories", defaultCategories.size());
        } else {
            log.info("? Categories already exist. Skipping category seeder.");
        }
    }
}
