-- Seed Data for Library Management System

-- 1. System Settings (Admin / Librarian)
INSERT INTO system_settings (id, library_name, librarian_name, librarian_email, librarian_phone, max_books_per_user, loan_period_days, fine_rate_per_day, system_notice)
SELECT 1, 'Central College Library', 'Dr. Sarah Jenkins', 'librarian@college.edu', '+1-555-0199', 3, 14, 5.0, 'Welcome to the Central College Library Management System. Please return books on time.'
WHERE NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1);

-- 2. Users (User Management)
INSERT INTO users (id, name, email, phone, membership_type, status, created_date)
SELECT 1, 'Alice Johnson', 'alice.j@college.edu', '9876543210', 'Student', 'Active', '2026-09-01'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT INTO users (id, name, email, phone, membership_type, status, created_date)
SELECT 2, 'Bob Smith', 'bob.smith@college.edu', '9876543211', 'Student', 'Active', '2026-09-05'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 2);

INSERT INTO users (id, name, email, phone, membership_type, status, created_date)
SELECT 3, 'Prof. Alan Turing', 'a.turing@college.edu', '9876543212', 'Faculty', 'Active', '2026-09-10'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 3);

INSERT INTO users (id, name, email, phone, membership_type, status, created_date)
SELECT 4, 'David Warner', 'david.w@college.edu', '9876543213', 'Student', 'Inactive', '2026-09-12'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 4);

INSERT INTO users (id, name, email, phone, membership_type, status, created_date)
SELECT 5, 'Emma Watson', 'emma.w@college.edu', '9876543214', 'Student', 'Active', '2026-09-15'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 5);

-- 3. Books (Book Management)
INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 1, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262033848', 'Computer Science', 'MIT Press', 'Rack CS-101', 5, 4, 65.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 1);

INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 2, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Software Engineering', 'Prentice Hall', 'Rack CS-102', 4, 3, 42.50
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 2);

INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 3, 'Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'Computer Science', 'McGraw-Hill', 'Rack CS-103', 6, 5, 55.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 3);

INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 4, 'Artificial Intelligence: A Modern Approach', 'Stuart Russell', '978-0136042594', 'Artificial Intelligence', 'Pearson', 'Rack AI-201', 3, 3, 75.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 4);

INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 5, 'Head First Design Patterns', 'Eric Freeman', '978-0596007126', 'Software Engineering', 'O Reilly Media', 'Rack CS-104', 5, 4, 48.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 5);

INSERT INTO books (id, title, author, isbn, category, publisher, rack_number, total_copies, available_copies, price)
SELECT 6, 'Discrete Mathematics and Its Applications', 'Kenneth H. Rosen', '978-0073383095', 'Mathematics', 'McGraw-Hill', 'Rack MATH-01', 4, 4, 50.00
WHERE NOT EXISTS (SELECT 1 FROM books WHERE id = 6);

-- 4. Book Issues (Book Issue & Return)
INSERT INTO book_issues (id, user_id, book_id, issue_date, due_date, return_date, status, remarks)
SELECT 1, 1, 1, '2026-09-15', '2026-09-29', NULL, 'ISSUED', 'Semester reference'
WHERE NOT EXISTS (SELECT 1 FROM book_issues WHERE id = 1);

INSERT INTO book_issues (id, user_id, book_id, issue_date, due_date, return_date, status, remarks)
SELECT 2, 2, 2, '2026-09-10', '2026-09-24', NULL, 'OVERDUE', 'Assignment reading'
WHERE NOT EXISTS (SELECT 1 FROM book_issues WHERE id = 2);

INSERT INTO book_issues (id, user_id, book_id, issue_date, due_date, return_date, status, remarks)
SELECT 3, 3, 3, '2026-09-01', '2026-09-15', '2026-09-14', 'RETURNED', 'Returned in good condition'
WHERE NOT EXISTS (SELECT 1 FROM book_issues WHERE id = 3);

INSERT INTO book_issues (id, user_id, book_id, issue_date, due_date, return_date, status, remarks)
SELECT 4, 1, 5, '2026-09-01', '2026-09-15', '2026-09-20', 'RETURNED', 'Returned 5 days late'
WHERE NOT EXISTS (SELECT 1 FROM book_issues WHERE id = 4);

-- 5. Fines (Fine Management)
INSERT INTO fines (id, issue_id, user_id, amount, overdue_days, status, paid_date, payment_mode, remarks)
SELECT 1, 4, 1, 25.0, 5, 'UNPAID', NULL, NULL, 'Returned 5 days late - Fine ₹5/day'
WHERE NOT EXISTS (SELECT 1 FROM fines WHERE id = 1);
