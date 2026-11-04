-- =============================================================================
-- KisanMandi - V7 In-App Notifications V2 (i18n, Events, Link, Read Timestamp)
-- Upgrades notifications table to store translation keys + params and read_at timestamp
-- =============================================================================

-- Add new columns to existing notifications table
ALTER TABLE `notifications`
  ADD COLUMN `title_key` VARCHAR(80) NOT NULL DEFAULT 'notifications.default.title',
  ADD COLUMN `body_key` VARCHAR(80) NOT NULL DEFAULT 'notifications.default.body',
  ADD COLUMN `params_json` TEXT NULL,
  ADD COLUMN `fallback_text` VARCHAR(300) NOT NULL DEFAULT '',
  ADD COLUMN `link` VARCHAR(200) NULL,
  ADD COLUMN `read_at` DATETIME(6) NULL;

-- Backfill fallback_text from existing message/title and read_at from is_read
UPDATE `notifications`
SET `fallback_text` = LEFT(COALESCE(`message`, `title`, ''), 300),
    `read_at` = CASE WHEN `is_read` = b'1' OR `is_read` = 1 THEN `created_at` ELSE NULL END;

-- Drop obsolete index and columns
DROP INDEX `idx_notifications_user_read` ON `notifications`;

ALTER TABLE `notifications`
  DROP COLUMN `title`,
  DROP COLUMN `message`,
  DROP COLUMN `reference_id`,
  DROP COLUMN `is_read`,
  MODIFY COLUMN `type` VARCHAR(40) NOT NULL;

-- Create composite index on (user_id, read_at, created_at DESC)
CREATE INDEX `idx_notifications_user_read_created`
  ON `notifications` (`user_id`, `read_at`, `created_at` DESC);
