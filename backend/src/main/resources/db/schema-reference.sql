-- Reference schema for Member 4: users, notifications, preferences, support, password reset.
-- With spring.jpa.hibernate.ddl-auto=update, Hibernate creates/updates these automatically.
-- Create database campus_hub first (or rely on JDBC createDatabaseIfNotExist).

CREATE DATABASE IF NOT EXISTS campus_hub
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_hub;

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT       NOT NULL AUTO_INCREMENT,
    full_name       VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    username        VARCHAR(32)  NULL,
    role            VARCHAR(255) NOT NULL,
    auth_provider   VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NULL,
    enabled         BOOLEAN      NOT NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email (email),
    UNIQUE KEY uq_users_username (username)
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

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    token       VARCHAR(100) NOT NULL,
    expires_at  DATETIME(6)  NOT NULL,
    used        BOOLEAN      NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_pwd_reset_token (token),
    CONSTRAINT fk_pwd_reset_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_requests (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    user_id      BIGINT        NOT NULL,
    subject      VARCHAR(200)  NOT NULL,
    description  VARCHAR(4000) NOT NULL,
    status       VARCHAR(255)  NOT NULL,
    admin_notes  VARCHAR(4000) NULL,
    created_at   DATETIME(6)   NOT NULL,
    updated_at   DATETIME(6)   NOT NULL,
    PRIMARY KEY (id),
    KEY idx_support_user (user_id),
    CONSTRAINT fk_support_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
