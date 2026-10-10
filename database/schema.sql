-- ============================================================================
-- CampusNest: Smart Library and Academic Management System
-- Database Schema (MySQL 8.0+)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS campusnest_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campusnest_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    first_login BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB;

CREATE INDEX idx_users_username ON users (username);
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role_id);

-- 3. Students Table
CREATE TABLE IF NOT EXISTS students (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    registration_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_students_reg_no ON students (registration_number);
CREATE INDEX idx_students_dept ON students (department);

-- 4. Faculty Table
CREATE TABLE IF NOT EXISTS faculty (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE INDEX idx_faculty_emp_id ON faculty (employee_id);
CREATE INDEX idx_faculty_dept ON faculty (department);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. Books Table
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    isbn VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    category_id BIGINT NOT NULL,
    publisher VARCHAR(150),
    publication_year INT,
    description TEXT,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    cover_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_books_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT chk_book_copies CHECK (available_copies >= 0 AND available_copies <= total_copies)
) ENGINE=InnoDB;

CREATE INDEX idx_books_isbn ON books (isbn);
CREATE INDEX idx_books_title ON books (title);
CREATE INDEX idx_books_author ON books (author);
CREATE INDEX idx_books_category ON books (category_id);

-- 7. Library Settings Table
CREATE TABLE IF NOT EXISTS library_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 8. Borrow Transactions Table
CREATE TABLE IF NOT EXISTS borrow_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    book_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ISSUED',
    issued_by_admin_id BIGINT NULL,
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    overdue_days INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_borrow_book FOREIGN KEY (book_id) REFERENCES books (id),
    CONSTRAINT fk_borrow_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_borrow_admin FOREIGN KEY (issued_by_admin_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE INDEX idx_borrow_status ON borrow_transactions (status);
CREATE INDEX idx_borrow_due_date ON borrow_transactions (due_date);
CREATE INDEX idx_borrow_user ON borrow_transactions (user_id);
CREATE INDEX idx_borrow_book ON borrow_transactions (book_id);

-- 9. Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_id BIGINT NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    overdue_days INT NOT NULL DEFAULT 0,
    daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
    fine_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    balance_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    assessed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fines_transaction FOREIGN KEY (transaction_id) REFERENCES borrow_transactions (id),
    CONSTRAINT fk_fines_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE INDEX idx_fines_user ON fines (user_id);
CREATE INDEX idx_fines_status ON fines (status);

-- 10. Fine Payments Table
CREATE TABLE IF NOT EXISTS fine_payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fine_id BIGINT NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'CASH',
    receipt_number VARCHAR(100) NOT NULL UNIQUE,
    received_by_admin_id BIGINT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fine_payments_fine FOREIGN KEY (fine_id) REFERENCES fines (id),
    CONSTRAINT fk_fine_payments_admin FOREIGN KEY (received_by_admin_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE INDEX idx_payments_fine ON fine_payments (fine_id);
CREATE INDEX idx_payments_receipt ON fine_payments (receipt_number);

-- 11. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    faculty_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_projects_faculty FOREIGN KEY (faculty_id) REFERENCES faculty (id)
) ENGINE=InnoDB;

CREATE INDEX idx_projects_faculty ON projects (faculty_id);
CREATE INDEX idx_projects_dept_course ON projects (department, course);
CREATE INDEX idx_projects_due_date ON projects (due_date);

-- 12. Project Submissions Table
CREATE TABLE IF NOT EXISTS project_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submission_text TEXT,
    file_url VARCHAR(500),
    file_name VARCHAR(255),
    file_size BIGINT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    grade VARCHAR(20),
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_submissions_project FOREIGN KEY (project_id) REFERENCES projects (id),
    CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT uq_project_student UNIQUE (project_id, student_id)
) ENGINE=InnoDB;

CREATE INDEX idx_submissions_project ON project_submissions (project_id);
CREATE INDEX idx_submissions_student ON project_submissions (student_id);

-- 13. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_id BIGINT NULL,
    reference_type VARCHAR(50) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_user ON notifications (user_id);
CREATE INDEX idx_notifications_read ON notifications (is_read);
CREATE INDEX idx_notifications_dedup ON notifications (user_id, reference_type, reference_id, type);
