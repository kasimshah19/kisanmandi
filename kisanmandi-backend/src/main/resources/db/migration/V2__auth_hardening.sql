-- =============================================================================
-- KisanMandi - V2 Auth Hardening Migration
-- Adds email verification, brute-force lockout, token versioning, and token tables
-- =============================================================================

-- 1. Alter users table for auth hardening
ALTER TABLE `users`
  ADD COLUMN `email_verified` BIT(1) NOT NULL DEFAULT b'0',
  ADD COLUMN `token_version` INT NOT NULL DEFAULT 1,
  ADD COLUMN `failed_login_attempts` INT NOT NULL DEFAULT 0,
  ADD COLUMN `lockout_until` DATETIME(6) DEFAULT NULL,
  ADD COLUMN `password_changed_at` DATETIME(6) DEFAULT NULL;

-- Ensure existing ADMIN users are marked as email verified
UPDATE `users` SET `email_verified` = b'1' WHERE `role` = 'ADMIN';

-- 2. Password reset tokens table (stores only SHA-256 token hashes)
CREATE TABLE `password_reset_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used` BIT(1) NOT NULL DEFAULT b'0',
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_password_reset_tokens_hash` UNIQUE (`token_hash`),
  KEY `idx_password_reset_user` (`user_id`),
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Email verification tokens table (stores only SHA-256 token hashes)
CREATE TABLE `email_verification_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `used` BIT(1) NOT NULL DEFAULT b'0',
  `created_at` DATETIME(6) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_email_verification_tokens_hash` UNIQUE (`token_hash`),
  KEY `idx_email_verification_user` (`user_id`),
  CONSTRAINT `fk_email_verification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
