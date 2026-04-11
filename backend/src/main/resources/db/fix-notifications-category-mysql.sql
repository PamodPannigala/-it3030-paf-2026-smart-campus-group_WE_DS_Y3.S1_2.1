-- Run this once if inserts fail with: Data truncated for column 'category'
-- (Older Hibernate/MySQL schemas used ENUM without the SYSTEM value.)
ALTER TABLE notifications MODIFY COLUMN category VARCHAR(64) NOT NULL;
