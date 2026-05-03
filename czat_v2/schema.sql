CREATE TABLE `chat_messages_v2` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `message_type` ENUM('text', 'image') NOT NULL DEFAULT 'text',
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chat_reactions_v2` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message_id` BIGINT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `emoji` VARCHAR(32) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_message_user_emoji` (`message_id`, `user_id`, `emoji`),
  INDEX `idx_message_id` (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
