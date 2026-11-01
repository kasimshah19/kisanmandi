-- =============================================================================
-- KisanMandi - V3 Online Payments Migration
-- Adds ONLINE payment mode, FAILED/REFUNDED payment statuses, and gateway columns
-- =============================================================================

ALTER TABLE `orders`
  MODIFY COLUMN `payment_mode` ENUM('COD','ONLINE') NOT NULL,
  MODIFY COLUMN `payment_status` ENUM('FAILED','PAID','PENDING','REFUNDED') NOT NULL,
  ADD COLUMN `razorpay_order_id` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `razorpay_payment_id` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `razorpay_signature` VARCHAR(255) DEFAULT NULL,
  ADD COLUMN `refund_id` VARCHAR(100) DEFAULT NULL,
  ADD COLUMN `refund_amount` DECIMAL(12,2) DEFAULT NULL,
  ADD COLUMN `refunded_at` DATETIME(6) DEFAULT NULL,
  ADD KEY `idx_orders_razorpay_order` (`razorpay_order_id`);
