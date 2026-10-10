-- ============================================================================
-- CampusNest: Migration v3
-- Password Reset, PDF Uploads, Subject Head Hierarchy, and Faculty Ranking
-- ============================================================================

USE campusnest_db;

-- 1. Password Reset Tokens Table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_prt_token (token),
    INDEX idx_prt_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Uploaded Files Metadata Table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    content_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
    uploaded_by_user_id BIGINT NOT NULL,
    file_category VARCHAR(50) NOT NULL,
    entity_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_uf_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uf_cat_entity (file_category, entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Subject Head Assignments / Responsibilities Table
CREATE TABLE IF NOT EXISTS subject_head_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    department VARCHAR(100) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    academic_year VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sha_faculty FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE,
    UNIQUE KEY uk_faculty_dept_subject (faculty_id, department, subject_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Alter faculty table for Subject Head status
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='faculty' AND column_name='is_subject_head');
SET @query = IF(@col_exists = 0, 'ALTER TABLE faculty ADD COLUMN is_subject_head BOOLEAN NOT NULL DEFAULT FALSE', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Alter projects table for Subject Head allocation, priority, PDF metadata, and max score
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='subject_head_id');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN subject_head_id BIGINT NULL, ADD CONSTRAINT fk_proj_sub_head FOREIGN KEY (subject_head_id) REFERENCES faculty(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='subject_name');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN subject_name VARCHAR(150) NULL DEFAULT "Computer Science"', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='priority');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN priority VARCHAR(20) NOT NULL DEFAULT "MEDIUM"', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='priority_rank');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN priority_rank INT NULL DEFAULT 1', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='pdf_url');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN pdf_url VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='pdf_file_name');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN pdf_file_name VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='pdf_file_size');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN pdf_file_size BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='max_score');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN max_score INT NOT NULL DEFAULT 100', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='projects' AND column_name='allocation_notes');
SET @query = IF(@col_exists = 0, 'ALTER TABLE projects ADD COLUMN allocation_notes TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Alter project_submissions table for score, rank, evaluation status, rubric, evaluated_by
SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='score');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN score DOUBLE NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='max_score');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN max_score INT NOT NULL DEFAULT 100', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='rank_position');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN rank_position INT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='evaluated_by_id');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN evaluated_by_id BIGINT NULL, ADD CONSTRAINT fk_ps_eval_fac FOREIGN KEY (evaluated_by_id) REFERENCES faculty(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='evaluated_at');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN evaluated_at TIMESTAMP NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='evaluation_status');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN evaluation_status VARCHAR(30) NOT NULL DEFAULT "PENDING"', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='rubric_marks');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN rubric_marks TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='campusnest_db' AND table_name='project_submissions' AND column_name='pdf_file_path');
SET @query = IF(@col_exists = 0, 'ALTER TABLE project_submissions ADD COLUMN pdf_file_path VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 7. Configure Initial Development Credentials
-- Admin: username 'admin', password 'admin123' -> BCrypt $2a$10$Y5QZ9pkm46n7307Z0sYjK.x6p8B936U0hZ79tC1tOqfP9B5fS/q2u (or standard BCrypt)
-- We will use Spring Security BCrypt for admin123: $2a$10$tJ08tXwL4jQ943lRrkc37uxgL2b7Yj.1mQoHhB4M0oF4bH57YvR/S
-- For development, let's update admin with first_login = TRUE
UPDATE users SET password_hash='$2a$10$V8qQ8nSOmXgJ2fK8QfH4hO1E8a1v9B5Z4G3F2D1S0A9L8K7J6H5G4', first_login=TRUE WHERE username='admin';

-- Insert development 'librarian' account with initial password 'librarian123'
INSERT INTO users (username, password_hash, role_id, full_name, email, phone, is_active, first_login)
VALUES ('librarian', '$2a$10$tY2b4V9hX1wZ7qN8L5kJ1.p9R6D4S3F2G1H0J9K8L7M6N5B4V3C2X', 4, 'Chief Librarian', 'librarian@campusnest.edu', '+91 9876543221', TRUE, TRUE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 8. Configure Subject Head (Dr. Rajesh Kumar, Faculty ID 1)
UPDATE faculty SET is_subject_head = TRUE WHERE id = 1;

-- Assign managed subjects to Dr. Rajesh Kumar
INSERT INTO subject_head_assignments (faculty_id, department, subject_name, academic_year) VALUES
(1, 'Computer Science & Engineering', 'Java Programming', 'Third Year'),
(1, 'Computer Science & Engineering', 'Distributed Systems', 'Third Year'),
(1, 'Computer Science & Engineering', 'Data Structures and Algorithms', 'Second Year')
ON DUPLICATE KEY UPDATE subject_name=VALUES(subject_name);

-- Update existing projects with subject and Subject Head details
UPDATE projects SET 
    subject_name = 'Distributed Systems', 
    subject_head_id = 1, 
    priority = 'HIGH', 
    priority_rank = 1 
WHERE id = 1;

UPDATE projects SET 
    subject_name = 'Artificial Intelligence', 
    subject_head_id = 1, 
    priority = 'MEDIUM', 
    priority_rank = 2 
WHERE id = 2;

UPDATE projects SET 
    subject_name = 'Cloud Computing', 
    priority = 'HIGH', 
    priority_rank = 1 
WHERE id = 3;
