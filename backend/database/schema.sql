-- MySQL Schema for "Our Little World ❤️" Private Couple Application
CREATE DATABASE IF NOT EXISTS `our_little_world` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `our_little_world`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `email` VARCHAR(100) UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(20) DEFAULT 'couple',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Password recovery tokens. Store only a SHA-256 hash of the token sent to the user.
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `token_hash` VARCHAR(64) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `used_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Couple App Settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `my_name` VARCHAR(50) DEFAULT 'Nihar',
  `gf_name` VARCHAR(50) DEFAULT 'Isha',
  `relationship_start_date` DATE DEFAULT '2026-06-23',
  `anniversary_date` DATE DEFAULT '2026-06-23',
  `secret_pin_hash` VARCHAR(255) NOT NULL,
  `app_title` VARCHAR(100) DEFAULT 'Infinity ❤️',
  `my_avatar` VARCHAR(255) DEFAULT '',
  `gf_avatar` VARCHAR(255) DEFAULT '',
  `hero_background_filename` VARCHAR(255) DEFAULT '',
  `hero_background_scale` INT DEFAULT 100,
  `hero_background_x` INT DEFAULT 50,
  `hero_background_y` INT DEFAULT 50,
  `bg_music_url` VARCHAR(500) DEFAULT '',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Memories / Photos Table
CREATE TABLE IF NOT EXISTS `memories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150),
  `caption` TEXT,
  `memory_date` DATE NOT NULL,
  `image_filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255),
  `mime_type` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Love Notes Table
CREATE TABLE IF NOT EXISTS `love_notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'general', -- e.g. "Why I Love You", "Open When...", "Future"
  `note_date` DATE NOT NULL,
  `is_bookmarked` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Our Story Stages Table (How It Started, First Date, etc.)
CREATE TABLE IF NOT EXISTS `our_story` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `subtitle` VARCHAR(200),
  `content` TEXT NOT NULL,
  `stage_type` VARCHAR(50) NOT NULL, -- e.g. "how_it_started", "first_conversation", "first_date", "favorite_memory", "today"
  `event_date` DATE NOT NULL,
  `image_filename` VARCHAR(255) DEFAULT '',
  `order_index` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Visual Timeline Events Table
CREATE TABLE IF NOT EXISTS `timeline_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `event_date` DATE NOT NULL,
  `image_filename` VARCHAR(255) DEFAULT '',
  `icon` VARCHAR(50) DEFAULT 'heart',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Special Events & Countdowns Table
CREATE TABLE IF NOT EXISTS `special_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `event_date` DATE NOT NULL,
  `event_type` VARCHAR(50) DEFAULT 'custom', -- anniversary, birthday, first_meeting, first_date, trip, custom
  `icon` VARCHAR(50) DEFAULT 'heart',
  `notes` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Secret Corner Items Table (Requires PIN verification)
CREATE TABLE IF NOT EXISTS `secret_notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'secret_note', -- secret_note, future_plan, bucket_list, private_message
  `target_date` DATE NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
