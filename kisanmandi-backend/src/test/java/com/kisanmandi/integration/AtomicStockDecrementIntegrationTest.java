package com.kisanmandi.integration;

import com.kisanmandi.entity.Category;
import com.kisanmandi.entity.Product;
import com.kisanmandi.entity.ProductUnit;
import com.kisanmandi.entity.Role;
import com.kisanmandi.entity.User;
import com.kisanmandi.repository.CategoryRepository;
import com.kisanmandi.repository.ProductRepository;
import com.kisanmandi.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AtomicStockDecrementIntegrationTest extends MySqlIntegrationTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Test
    @DisplayName("Verify atomic stock decrement with 20 competing concurrent threads on 5 available items")
    void testConcurrentStockDecrementPreventsOverSale() throws Exception {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);

        Long productId = tx.execute(status -> {
            User farmer = userRepository.findByEmail("farmer_concurrent@kisanmandi.com")
                    .orElseGet(() -> userRepository.save(User.builder()
                            .email("farmer_concurrent@kisanmandi.com")
                            .phone("9876543299")
                            .password("Hash123456")
                            .name("Concurrent Farmer")
                            .role(Role.FARMER)
                            .build()));

            Category category = categoryRepository.findAll().stream().findFirst()
                    .orElseGet(() -> categoryRepository.save(Category.builder()
                            .name("Atomic Vegetables")
                            .build()));

            Product product = Product.builder()
                    .farmer(farmer)
                    .category(category)
                    .name("Atomic Potato")
                    .description("Fresh Stock")
                    .pricePerUnit(new BigDecimal("30.00"))
                    .unit(ProductUnit.KG)
                    .quantityAvailable(new BigDecimal("5.00"))
                    .active(true)
                    .deleted(false)
                    .build();

            return productRepository.save(product).getId();
        });

        int numThreads = 20;
        ExecutorService executor = Executors.newFixedThreadPool(numThreads);
        CountDownLatch readyLatch = new CountDownLatch(numThreads);
        CountDownLatch startLatch = new CountDownLatch(1);

        AtomicInteger successfulDecrements = new AtomicInteger(0);
        AtomicInteger failedDecrements = new AtomicInteger(0);

        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < numThreads; i++) {
            futures.add(executor.submit(() -> {
                readyLatch.countDown();
                try {
                    startLatch.await();
                    int updated = tx.execute(status ->
                            productRepository.decreaseStock(productId, BigDecimal.ONE)
                    );
                    if (updated == 1) {
                        successfulDecrements.incrementAndGet();
                    } else {
                        failedDecrements.incrementAndGet();
                    }
                } catch (Exception e) {
                    failedDecrements.incrementAndGet();
                }
            }));
        }

        readyLatch.await(5, TimeUnit.SECONDS);
        startLatch.countDown();

        for (Future<?> f : futures) {
            f.get(10, TimeUnit.SECONDS);
        }
        executor.shutdown();

        assertEquals(5, successfulDecrements.get(), "Exactly 5 stock decrements must succeed");
        assertEquals(15, failedDecrements.get(), "Exactly 15 decrements must fail due to zero stock");

        BigDecimal remainingStock = tx.execute(status ->
                productRepository.findById(productId).orElseThrow().getQuantityAvailable()
        );
        assertEquals(0, remainingStock.compareTo(BigDecimal.ZERO), "Remaining stock must be exactly 0");
    }
}
