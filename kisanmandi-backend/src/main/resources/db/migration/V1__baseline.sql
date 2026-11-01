-- =============================================================================
-- KisanMandi - V1 Baseline Schema Migration
-- Exact representation of initial schema with explicit index/constraint naming
-- =============================================================================

-- 1. Users table (Independent)
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('ADMIN','CUSTOMER','FARMER') NOT NULL,
  `status` ENUM('ACTIVE','BLOCKED') NOT NULL,
  `blocked_reason` VARCHAR(300) DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_users_email` UNIQUE (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Categories table (Independent)
CREATE TABLE `categories` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `active` BIT(1) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_categories_name` UNIQUE (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Farmer Profiles (Depends on users)
CREATE TABLE `farmer_profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `farm_name` VARCHAR(255) NOT NULL,
  `village` VARCHAR(255) NOT NULL,
  `district` VARCHAR(255) NOT NULL,
  `state` VARCHAR(255) NOT NULL,
  `pincode` VARCHAR(6) NOT NULL,
  `latitude` DOUBLE DEFAULT NULL,
  `longitude` DOUBLE DEFAULT NULL,
  `document_public_id` VARCHAR(255) DEFAULT NULL,
  `document_format` VARCHAR(255) DEFAULT NULL,
  `document_resource_type` VARCHAR(255) DEFAULT NULL,
  `approval_status` ENUM('APPROVED','PENDING','REJECTED') NOT NULL,
  `rejection_reason` VARCHAR(300) DEFAULT NULL,
  `submitted_at` DATETIME(6) DEFAULT NULL,
  `reviewed_at` DATETIME(6) DEFAULT NULL,
  `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT '0.00',
  `rating_count` INT NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_farmer_profiles_user_id` UNIQUE (`user_id`),
  KEY `idx_farmer_coords_status` (`latitude`,`longitude`,`approval_status`),
  CONSTRAINT `fk_farmer_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Addresses table (Depends on users)
CREATE TABLE `addresses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(10) NOT NULL,
  `line1` VARCHAR(255) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `state` VARCHAR(100) NOT NULL,
  `pincode` VARCHAR(6) NOT NULL,
  `latitude` DOUBLE DEFAULT NULL,
  `longitude` DOUBLE DEFAULT NULL,
  `default_address` BIT(1) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_addresses_user` (`user_id`),
  CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Products table (Depends on categories, users)
CREATE TABLE `products` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `farmer_id` BIGINT NOT NULL,
  `category_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(1000) DEFAULT NULL,
  `price_per_unit` DECIMAL(10,2) NOT NULL,
  `quantity_available` DECIMAL(10,2) NOT NULL,
  `unit` ENUM('DOZEN','KG','LITRE','PIECE','QUINTAL') NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `image_public_id` VARCHAR(255) DEFAULT NULL,
  `active` BIT(1) NOT NULL,
  `deleted` BIT(1) NOT NULL,
  `admin_hidden` BIT(1) NOT NULL,
  `admin_hidden_reason` VARCHAR(300) DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_product_category` (`category_id`),
  KEY `idx_product_farmer` (`farmer_id`),
  KEY `idx_product_visibility_created` (`active`,`deleted`,`admin_hidden`,`created_at`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  CONSTRAINT `fk_products_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. Cart Items (Depends on users, products)
CREATE TABLE `cart_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT NOT NULL,
  `product_id` BIGINT NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_cart_items_customer_product` UNIQUE (`customer_id`,`product_id`),
  KEY `idx_cart_items_product` (`product_id`),
  CONSTRAINT `fk_cart_items_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_cart_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Orders table (Depends on users)
CREATE TABLE `orders` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT NOT NULL,
  `farmer_id` BIGINT NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `status` ENUM('ACCEPTED','CANCELLED','DELIVERED','OUT_FOR_DELIVERY','PACKED','PLACED','REJECTED') NOT NULL,
  `payment_mode` ENUM('COD') NOT NULL,
  `payment_status` ENUM('PAID','PENDING') NOT NULL,
  `ship_name` VARCHAR(100) NOT NULL,
  `ship_phone` VARCHAR(10) NOT NULL,
  `ship_line1` VARCHAR(255) NOT NULL,
  `ship_city` VARCHAR(100) NOT NULL,
  `ship_state` VARCHAR(100) NOT NULL,
  `ship_pincode` VARCHAR(6) NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_customer` (`customer_id`),
  KEY `idx_order_farmer` (`farmer_id`),
  KEY `idx_order_status` (`status`),
  KEY `idx_order_farmer_status` (`farmer_id`,`status`),
  KEY `idx_order_customer_created` (`customer_id`,`created_at`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_orders_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. Order Items (Depends on orders, products)
CREATE TABLE `order_items` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `product_id` BIGINT DEFAULT NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `price_at_order` DECIMAL(10,2) NOT NULL,
  `quantity` DECIMAL(10,2) NOT NULL,
  `unit` ENUM('DOZEN','KG','LITRE','PIECE','QUINTAL') NOT NULL,
  `line_total` DECIMAL(12,2) NOT NULL,
  `image_url` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_items_order` (`order_id`),
  KEY `idx_order_items_product` (`product_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. Order Status History (Depends on orders)
CREATE TABLE `order_status_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `status` ENUM('ACCEPTED','CANCELLED','DELIVERED','OUT_FOR_DELIVERY','PACKED','PLACED','REJECTED') NOT NULL,
  `changed_by_role` VARCHAR(50) NOT NULL,
  `note` VARCHAR(300) DEFAULT NULL,
  `changed_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_order_status_history_order` (`order_id`),
  CONSTRAINT `fk_order_status_history_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. Reviews table (Depends on orders, users)
CREATE TABLE `reviews` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT NOT NULL,
  `customer_id` BIGINT NOT NULL,
  `farmer_id` BIGINT NOT NULL,
  `rating` INT NOT NULL,
  `comment` VARCHAR(500) DEFAULT NULL,
  `hidden` BIT(1) NOT NULL,
  `hidden_reason` VARCHAR(300) DEFAULT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_reviews_order_id` UNIQUE (`order_id`),
  KEY `idx_review_customer` (`customer_id`),
  KEY `idx_review_farmer` (`farmer_id`),
  KEY `idx_review_farmer_hidden_created` (`farmer_id`,`hidden`,`created_at`),
  CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_reviews_farmer` FOREIGN KEY (`farmer_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. Mandi Prices (Independent)
CREATE TABLE `mandi_prices` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `state` VARCHAR(50) NOT NULL,
  `district` VARCHAR(60) NOT NULL,
  `market` VARCHAR(100) NOT NULL,
  `commodity` VARCHAR(80) NOT NULL,
  `variety` VARCHAR(80) NOT NULL,
  `grade` VARCHAR(30) NOT NULL,
  `min_price` DECIMAL(10,2) DEFAULT NULL,
  `max_price` DECIMAL(10,2) DEFAULT NULL,
  `modal_price` DECIMAL(10,2) DEFAULT NULL,
  `price_date` DATE NOT NULL,
  `source` ENUM('API','DEMO') NOT NULL,
  `created_at` DATETIME(6) DEFAULT NULL,
  `updated_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_mandi_prices_unique_tuple` UNIQUE (`state`,`district`,`market`,`commodity`,`variety`,`grade`,`price_date`),
  KEY `idx_commodity_date` (`commodity`,`price_date`),
  KEY `idx_state_dist_market` (`state`,`district`,`market`),
  KEY `idx_price_date` (`price_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 12. Mandi Sync Logs (Independent)
CREATE TABLE `mandi_sync_logs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `started_at` DATETIME(6) NOT NULL,
  `finished_at` DATETIME(6) DEFAULT NULL,
  `status` ENUM('FAILED','PARTIAL','RUNNING','SUCCESS') NOT NULL,
  `trigger_source` ENUM('MANUAL','SCHEDULED','STARTUP') NOT NULL,
  `records_fetched` INT NOT NULL,
  `records_inserted` INT NOT NULL,
  `records_updated` INT NOT NULL,
  `records_skipped` INT NOT NULL,
  `error_message` VARCHAR(1000) DEFAULT NULL,
  `duration_ms` BIGINT DEFAULT NULL,
  `details` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
