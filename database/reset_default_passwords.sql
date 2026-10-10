-- ============================================================================
-- CAMPUSNEST DATABASE UTILITY SCRIPT: RESET DEFAULT DEVELOPMENT PASSWORDS
-- Target Database: campusnest_db
-- Description: Sets standard local development default passwords for demonstration accounts.
-- Configured Credentials:
--   Role: Admin     | Identifier: Admin      | Default Password: ADM2026
--   Role: Librarian | Identifier: librarian  | Default Password: LIB2026
--   Role: Faculty   | Identifier: FAC2026001 | Default Password: FAC2026
--   Role: Student   | Identifier: STU2026001 | Default Password: STU2026
-- Safety: Preserves all books, student profiles, borrow records, projects & fines.
-- ============================================================================

USE campusnest_db;

-- 1. Reset Admin Account (Username: Admin, Password: ADM2026)
UPDATE users
SET username = 'Admin',
    password_hash = '$2a$10$pLUxnVkGworrlwyJhBmQk.D7KNG5nTb2cw0ZbcfJ8OOTyGIS9V.Bi',
    role_id = (SELECT id FROM roles WHERE name = 'ROLE_ADMIN' LIMIT 1),
    is_active = 1,
    first_login = 0
WHERE id = 1 OR LOWER(username) = 'admin' OR email = 'admin@campusnest.edu';

-- 2. Reset Librarian Account (Username: librarian, Password: LIB2026)
UPDATE users
SET password_hash = '$2a$10$AMcXl.MpLCm4hyZynNyuzOqiVc0P7t8.Z0AvphRRLe63g6798sLei',
    role_id = (SELECT id FROM roles WHERE name = 'ROLE_LIBRARIAN' LIMIT 1),
    is_active = 1,
    first_login = 0
WHERE username = 'librarian' OR username = 'LIB2026001' OR email = 'librarian@campusnest.edu';

-- 3. Reset Demonstration Faculty Accounts (Password: FAC2026)
UPDATE users
SET password_hash = '$2a$10$S0rTgJjmMFyUPUbdpTZFSuoubPAQCbTv/YseS1nxaPhzyZ8eBHAf.',
    is_active = 1,
    first_login = 0
WHERE username IN ('FAC2026001', 'FAC2026002', 'FAC2026003', 'FAC2026004')
   OR (role_id = (SELECT id FROM roles WHERE name = 'ROLE_FACULTY' LIMIT 1) AND email LIKE '%campusnest.edu');

-- 4. Reset Demonstration Student Accounts (Password: STU2026)
UPDATE users
SET password_hash = '$2a$10$/fKUnasUaNa6VQpRhzcu5uFgkKzDKNqUMwKc5DG32vdBoGU0tC91u',
    is_active = 1,
    first_login = 0
WHERE username IN ('STU2026001', 'STU2026002', 'STU2026003', 'STU2026004', 'STU2026005')
   OR (role_id = (SELECT id FROM roles WHERE name = 'ROLE_STUDENT' LIMIT 1) AND email LIKE '%campusnest.edu');

-- Verification
SELECT u.id, u.username, r.name AS role, u.is_active, u.first_login
FROM users u
JOIN roles r ON u.role_id = r.id
WHERE u.username IN ('Admin', 'librarian', 'FAC2026001', 'FAC2026002', 'STU2026001', 'STU2026002')
ORDER BY u.id;
