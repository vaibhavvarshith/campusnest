-- ============================================================================
-- CAMPUSNEST DATABASE REPAIR SCRIPT: ADMINISTRATOR ACCOUNT
-- Target Database: campusnest_db
-- Description: Repairs or initializes the local development administrator account
-- Credentials Configured:
--   Username: Admin (Exact case, capitalized 'A')
--   Password: Admin2026
--   BCrypt Hash: $2a$10$TJFuSvv0VCj5HMuaeuBTveWPr0OqDTEM8WdtJV3TtW1v4lreDkHfy
--   Role: ROLE_ADMIN
--   Account Status: Active (is_active = 1)
--   First Login Required: False (first_login = 0)
-- Safety: Preserves all books, students, faculty, borrow records, fines & projects.
-- ============================================================================

USE campusnest_db;

-- 1. Ensure the ROLE_ADMIN exists
INSERT INTO roles (id, name, description)
SELECT 1, 'ROLE_ADMIN', 'Administrator with full system privileges'
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

-- 2. Update existing administrator account if present by id 1, username 'admin', or admin email
UPDATE users
SET username = 'Admin',
    password_hash = '$2a$10$TJFuSvv0VCj5HMuaeuBTveWPr0OqDTEM8WdtJV3TtW1v4lreDkHfy',
    role_id = (SELECT id FROM roles WHERE name = 'ROLE_ADMIN' LIMIT 1),
    is_active = 1,
    first_login = 0
WHERE id = 1 
   OR LOWER(username) = 'admin' 
   OR email = 'admin@campusnest.edu';

-- 3. If no administrator account existed, create it
INSERT INTO users (id, username, password_hash, full_name, email, phone, role_id, is_active, first_login, created_at, updated_at)
SELECT 1, 'Admin', '$2a$10$TJFuSvv0VCj5HMuaeuBTveWPr0OqDTEM8WdtJV3TtW1v4lreDkHfy', 
       'System Administrator', 'admin@campusnest.edu', '+91 9876543210',
       (SELECT id FROM roles WHERE name = 'ROLE_ADMIN' LIMIT 1),
       1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'Admin' OR role_id = (SELECT id FROM roles WHERE name = 'ROLE_ADMIN' LIMIT 1));

-- 4. Verification queries
SELECT id, username, email, role_id, is_active, first_login, created_at 
FROM users 
WHERE username = 'Admin';
