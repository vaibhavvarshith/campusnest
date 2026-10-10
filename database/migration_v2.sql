-- ========================================================
-- CampusNest - Database Migration V2
-- Add borrow_requests table, ROLE_LIBRARIAN, academic year/sem/section
-- ========================================================

-- 1. Ensure ROLE_LIBRARIAN exists
INSERT INTO roles (id, name, description)
VALUES (4, 'ROLE_LIBRARIAN', 'Librarian with circulation desk, catalog, and fine management privileges')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Add Librarian user
INSERT INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active, first_login)
VALUES (12, 'LIB2026001', '$2a$10$IAwqvrACPmZo7x6ki2xA1.6LqvNNVwy0dmLcuNutYAipSFDet3Gdu', 4, 'Mrs. Savitha Deshmukh', 'librarian@campusnest.edu', '+91 9876543220', TRUE, FALSE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 3. Update students table
ALTER TABLE students 
ADD COLUMN semester INT NOT NULL DEFAULT 6,
ADD COLUMN section VARCHAR(10) NOT NULL DEFAULT 'A';

-- Update students with organized academic years, semesters, and sections
UPDATE students SET academic_year = 'Third Year', semester = 6, section = 'A' WHERE registration_number = 'STU2026001';
UPDATE students SET academic_year = 'Third Year', semester = 5, section = 'B' WHERE registration_number = 'STU2026002';
UPDATE students SET academic_year = 'Second Year', semester = 4, section = 'A' WHERE registration_number = 'STU2026003';
UPDATE students SET academic_year = 'First Year', semester = 2, section = 'A' WHERE registration_number = 'STU2026004';
UPDATE students SET academic_year = 'Fourth Year', semester = 7, section = 'C' WHERE registration_number = 'STU2026005';
UPDATE students SET academic_year = 'Third Year', semester = 6, section = 'A' WHERE registration_number = 'STU202618';

-- 4. Create borrow_requests table
CREATE TABLE IF NOT EXISTS borrow_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_notes TEXT NULL,
    processed_by_admin_id BIGINT NULL,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (processed_by_admin_id) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_req_user (user_id),
    INDEX idx_req_book (book_id),
    INDEX idx_req_status (status)
);

-- 5. Update projects table
ALTER TABLE projects 
ADD COLUMN academic_year VARCHAR(30) NOT NULL DEFAULT 'Third Year',
ADD COLUMN semester INT NOT NULL DEFAULT 6,
ADD COLUMN section VARCHAR(20) NOT NULL DEFAULT 'A',
ADD COLUMN instructions TEXT NULL,
ADD COLUMN submission_format VARCHAR(100) NOT NULL DEFAULT 'GitHub Repository / PDF Report',
ADD COLUMN attachment_url VARCHAR(255) NULL;

-- Set realistic values for existing projects
UPDATE projects SET 
  academic_year = 'Third Year', 
  semester = 6, 
  section = 'A',
  instructions = 'Develop a production-grade full-stack portal using Spring Boot and React. Include unit tests, database migrations, and CI configuration.',
  submission_format = 'GitHub Repository URL'
WHERE id = 1;

UPDATE projects SET 
  academic_year = 'Second Year', 
  semester = 4, 
  section = 'A',
  instructions = 'Build a responsive portfolio showcasing modern web standards, semantic HTML5, and responsive CSS grid layout.',
  submission_format = 'Live URL & GitHub Repository'
WHERE id = 2;
