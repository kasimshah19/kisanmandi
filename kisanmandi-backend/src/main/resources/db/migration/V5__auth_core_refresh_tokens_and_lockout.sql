-- =============================================================================
-- KisanMandi - V5 Auth Core: Refresh Tokens and Account Lockout Migration
-- Adds rotating refresh tokens and centralized login attempts tables
-- =============================================================================

-- 1. Refresh Tokens table (stores SHA-256 token hashes and token families)
CREATE TABLE `refresh_tokens` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `token_hash` CHAR(64) NOT NULL,
  `family_id` CHAR(36) NOT NULL,
  `expires_at` DATETIME(6) NOT NULL,
  `revoked_at` DATETIME(6) DEFAULT NULL,
  `replaced_by_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME(6) NOT NULL,
  `created_ip` VARCHAR(45) DEFAULT NULL,
  `user_agent` VARCHAR(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `uk_refresh_tokens_hash` UNIQUE (`token_hash`),
  KEY `idx_refresh_tokens_user` (`user_id`),
  KEY `idx_refresh_tokens_family` (`family_id`),
  CONSTRAINT `fk_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Login Attempts table (keyed by normalized lowercase email)
CREATE TABLE `login_attempts` (
  `email_key` VARCHAR(255) NOT NULL,
  `failed_count` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME(6) DEFAULT NULL,
  `last_failed_at` DATETIME(6) DEFAULT NULL,
  PRIMARY KEY (`email_key`),
  KEY `idx_login_attempts_locked_until` (`locked_until`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

