-- ==========================================================
-- Library Management System (8 Business Modules)
-- MySQL Database Script
-- ==========================================================

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

-- ----------------------------------------------------------
-- 1. Table: users (Module 1: User Management)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    membership_type VARCHAR(50) DEFAULT 'Student',
    status VARCHAR(20) DEFAULT 'Active',
    created_date DATE DEFAULT (CURRENT_DATE)
);

-- ----------------------------------------------------------
-- 2. Table: books (Module 2: Book Management)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS books (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    publisher VARCHAR(100),
    rack_number VARCHAR(30),
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    price DOUBLE DEFAULT 0.0
);

-- ----------------------------------------------------------
-- 3. Table: book_issues (Module 3 & 4: Book Issue & Book Return)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS book_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    book_id BIGINT NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE,
    status VARCHAR(30) DEFAULT 'ISSUED',
    remarks VARCHAR(255),
    CONSTRAINT fk_issue_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_issue_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 4. Table: fines (Module 5: Fine Management)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS fines (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    issue_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    amount DOUBLE NOT NULL DEFAULT 0.0,
    overdue_days INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'UNPAID',
    paid_date DATE,
    payment_mode VARCHAR(50),
    remarks VARCHAR(255),
    CONSTRAINT fk_fine_issue FOREIGN KEY (issue_id) REFERENCES book_issues(id) ON DELETE CASCADE,
    CONSTRAINT fk_fine_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------
-- 5. Table: system_settings (Module 8: Admin / Librarian)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT PRIMARY KEY,
    library_name VARCHAR(150) NOT NULL,
    librarian_name VARCHAR(100) NOT NULL,
    librarian_email VARCHAR(100) NOT NULL,
    librarian_phone VARCHAR(30),
    max_books_per_user INT DEFAULT 3,
    loan_period_days INT DEFAULT 14,
    fine_rate_per_day DOUBLE DEFAULT 5.0,
    system_notice TEXT
);

-- ==========================================================
-- Sample Initial Data for testing
-- ==========================================================

-- Insert System Settings
INSERT INTO system_settings (id, library_name, librarian_name, librarian_email, librarian_phone, max_books_per_user, loan_period_days, fine_rate_per_day, system_notice)
VALUES (1, 'Central College Library', 'Dr. Sarah Jenkins', 'librarian@college.edu', '+1-555-0199', 3, 14, 5.0, 'Welcome to the Central College Library Management System. Please return books on time to avoid fines.')
ON DUPLICATE KEY UPDATE library_name = VALUES(library_name);

-- Insert Users
INSERT INTO users (name, email, phone, membership_type, status, created_date)
VALUES 
('Alice Johnson', 'alice.j@college.edu', '9876543210', 'Student', 'Active', '2026-09-01'),
('Bob Smith', 'bob.smith@college.edu', '9876543211', 'Student', 'Active', '2026-09-05'),
('Prof. Alan Turing', 'a.turing@college.edu', '9876543212', 'Faculty', 'Active', '2026-09-10'),
('David Warner', 'david.w@college.edu', '9876543213', 'Student', 'Inactive', '2026-09-12'),
('Emma Watson', 'emma.w@college.edu', '9876543214', 'Student', 'Active', '2026-09-15');

-- Insert Books
INSERT INTO books (title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
VALUES
('Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 'MIT Press', 'Rack CS-101', 5, 4, 65.00),
('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'Prentice Hall', 'Rack CS-102', 4, 3, 42.50),
('Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'Computer Science', 'McGraw-Hill', 'Rack CS-103', 6, 5, 55.00),
('Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'Artificial Intelligence', 'Pearson', 'Rack AI-201', 3, 3, 75.00),
('Head First Design Patterns', 'Eric Freeman', '978-0596007126', 'Software Engineering', 'O Reilly Media', 'Rack CS-104', 5, 4, 48.00),
('Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', '978-0073383095', 'Mathematics', 'McGraw-Hill', 'Rack MATH-01', 4, 4, 50.00);

-- Insert Sample Book Issues
INSERT INTO book_issues (user_id, book_id, issue_date, due_date, return_date, status, remarks)
VALUES
(1, 1, '2026-09-15', '2026-09-29', NULL, 'ISSUED', 'First semester project reference'),
(2, 2, '2026-09-10', '2026-09-24', NULL, 'OVERDUE', 'Coding assignment'),
(3, 3, '2026-09-01', '2026-09-15', '2026-09-14', 'RETURNED', 'Returned on time in good condition'),
(1, 5, '2026-09-01', '2026-09-15', '2026-09-20', 'RETURNED', 'Returned 5 days late');

-- Insert Sample Fines
INSERT INTO fines (issue_id, user_id, amount, overdue_days, status, paid_date, payment_mode, remarks)
VALUES
(4, 1, 25.0, 5, 'UNPAID', NULL, NULL, 'Returned 5 days late - Fine ₹5/day');
