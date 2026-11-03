-- =============================================================================
-- KisanMandi - V6 Email Verification, Preferred Language, and User Tokens Migration
-- Grandfathers existing users as email verified, adds user_tokens table
-- =============================================================================

-- 1. Alter users table for verification timestamp and preferred language
ALTER TABLE `users`
  ADD COLUMN `email_verified_at` DATETIME(6) DEFAULT NULL,
  ADD COLUMN `preferred_language` VARCHAR(5) NOT NULL DEFAULT 'en';

-- 2. Grandfather all existing users as email verified
UPDATE `users`
SET `email_verified` = b'1',
    `email_verified_at` = NOW(6)
WHERE `email_verified` = b'0' OR `email_verified` IS NULL;

-- 3. Create unified user_tokens table for email verification and password reset
CREATE TABLE `user_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `type` ENUM('VERIFY_EMAIL', 'RESET_PASSWORD') NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used_at` DATETIME(6) DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_user_tokens_hash` UNIQUE (`token_hash`),
  KEY `idx_user_tokens_user_type` (`user_id`, `type`),
  CONSTRAINT `fk_user_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

