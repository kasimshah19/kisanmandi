-- =============================================================================
-- KisanMandi - V8 Online Payments V2 (Razorpay Test Mode, Idempotency & Awaiting Payment)
-- =============================================================================

-- 1. Orders schema enhancements
ALTER TABLE `orders`
  MODIFY COLUMN `status` ENUM('AWAITING_PAYMENT','ACCEPTED','CANCELLED','DELIVERED','OUT_FOR_DELIVERY','PACKED','PLACED','REJECTED') NOT NULL DEFAULT 'PLACED',
  MODIFY COLUMN `payment_mode` ENUM('COD','ONLINE') NOT NULL DEFAULT 'COD',
  ADD COLUMN `payment_group_id` CHAR(36) NULL AFTER `payment_status`,
  ADD COLUMN `payment_expires_at` DATETIME NULL AFTER `payment_group_id`,
  ADD COLUMN `refund_status` ENUM('NONE','REQUIRED','INITIATED','REFUNDED','FAILED') NOT NULL DEFAULT 'NONE' AFTER `refunded_at`,
  ADD KEY `idx_orders_payment_group` (`payment_group_id`);

-- 2. Order status history schema update
ALTER TABLE `order_status_history`
  MODIFY COLUMN `status` ENUM('AWAITING_PAYMENT','ACCEPTED','CANCELLED','DELIVERED','OUT_FOR_DELIVERY','PACKED','PLACED','REJECTED') NOT NULL;

-- 3. Payments table
CREATE TABLE `payments` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `payment_group_id` CHAR(36) NOT NULL UNIQUE,
  `customer_id` BIGINT NOT NULL,
  `razorpay_order_id` VARCHAR(40) UNIQUE NULL,
  `razorpay_payment_id` VARCHAR(40) UNIQUE NULL,
  `amount_paise` BIGINT NOT NULL,
  `currency` CHAR(3) NOT NULL DEFAULT 'INR',
  `status` ENUM('INITIATED','CREATED','PAID','FAILED','EXPIRED','CANCELLED') NOT NULL,
  `failure_reason` VARCHAR(200) NULL,
  `paid_at` DATETIME NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_payments_customer` (`customer_id`),
  KEY `idx_payments_status_expires` (`status`, `expires_at`),
  CONSTRAINT `fk_payments_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Payment events audit log table
CREATE TABLE `payment_events` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `event_id` VARCHAR(80) NOT NULL UNIQUE,
  `event_type` VARCHAR(60) NOT NULL,
  `razorpay_order_id` VARCHAR(40) NULL,
  `razorpay_payment_id` VARCHAR(40) NULL,
  `received_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` DATETIME NULL,
  `outcome` VARCHAR(40) NULL,
  KEY `idx_payment_events_order` (`razorpay_order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Checkout Idempotency table
CREATE TABLE `idempotency_keys` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `idem_key` VARCHAR(64) NOT NULL,
  `fingerprint` CHAR(64) NOT NULL,
  `status` ENUM('IN_PROGRESS','COMPLETED') NOT NULL,
  `response_status` INT NULL,
  `response_body` MEDIUMTEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME NULL,
  UNIQUE KEY `uq_idempotency_user_key` (`user_id`, `idem_key`),
  KEY `idx_idempotency_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

