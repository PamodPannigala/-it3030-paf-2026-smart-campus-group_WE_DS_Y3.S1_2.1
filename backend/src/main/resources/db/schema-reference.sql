-- Reference schema for Member 4: users, notifications, notification preferences.
-- With spring.jpa.hibernate.ddl-auto=update, Hibernate creates/updates these automatically.
-- Use this file for documentation or manual setup (create database campus_hub first).

CREATE DATABASE IF NOT EXISTS campus_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_hub;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    role            VARCHAR(255) NOT NULL,
    auth_provider   VARCHAR(255) NOT NULL,
    enabled         BOOLEAN      NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    user_id         BIGINT       NOT NULL,
    category        VARCHAR(255) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         VARCHAR(1000) NOT NULL,
    is_read         BOOLEAN      NOT NULL,
    reference_type  VARCHAR(255) NOT NULL,
    reference_id    VARCHAR(255) NULL,
    created_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    KEY idx_notifications_user (user_id),
    CONSTRAINT fk_notifications_user
      FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_preferences (
    id                         BIGINT  NOT NULL AUTO_INCREMENT,
    user_id                    BIGINT  NOT NULL,
    ticket_status_enabled      BOOLEAN NOT NULL,
    ticket_comment_enabled     BOOLEAN NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_notification_preferences_user (user_id),
    CONSTRAINT fk_notification_preferences_user
      FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
