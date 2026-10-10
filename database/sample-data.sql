-- ============================================================================
-- CampusNest: Smart Library and Academic Management System
-- Sample Data Script (Seed Data with >= 100 Books across 20 Categories)
-- ============================================================================

USE campusnest_db;

-- 1. Insert Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_ADMIN', 'Administrator with full system administration and library management access'),
(2, 'ROLE_STUDENT', 'College student with borrowing, deadline, and project submission access'),
(3, 'ROLE_FACULTY', 'College faculty with borrowing and academic project creation access'),
(4, 'ROLE_LIBRARIAN', 'Librarian with circulation desk, catalog, and fine management privileges')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Library Settings
INSERT INTO library_settings (setting_key, setting_value, description) VALUES
('daily_fine_rate', '5.00', 'Daily fine rate in INR for overdue book returns'),
('student_max_books', '3', 'Maximum number of books a student can borrow concurrently'),
('faculty_max_books', '6', 'Maximum number of books a faculty member can borrow concurrently'),
('student_borrow_days', '14', 'Default borrowing period in days for students'),
('faculty_borrow_days', '30', 'Default borrowing period in days for faculty'),
('system_timezone', 'Asia/Kolkata', 'Timezone used for deadline tracking and automated reminder notifications')
ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value);

-- 3. Insert Users
-- Passwords:
-- Admin (admin / Admin@123)
-- Student 1 (STU2026001 / 15082006 -> first_login=TRUE)
-- Student 2 (STU2026002 / Student@123 -> first_login=FALSE)
-- Student 3 (STU2026003 / Student@123 -> first_login=FALSE)
-- Student 4 (STU2026004 / Student@123 -> first_login=FALSE)
-- Student 5 (STU2026005 / Student@123 -> first_login=FALSE)
-- Faculty 1 (FAC2026001 / Faculty@123 -> first_login=FALSE)
-- Faculty 2 (FAC2026002 / Faculty@123 -> first_login=FALSE)
-- Librarian (LIB2026001 / Librarian@123 -> first_login=FALSE)
INSERT INTO users (id, username, password_hash, role_id, full_name, email, phone, is_active, first_login) VALUES
(1, 'admin', '$2a$10$IAwqvrACPmZo7x6ki2xA1.6LqvNNVwy0dmLcuNutYAipSFDet3Gdu', 1, 'Dr. Alistair Vance', 'admin@campusnest.edu', '+91 9876543210', TRUE, FALSE),
(2, 'STU2026001', '$2a$10$/Kl22WIACSL8zbVCzNaTNerti4CGGDHraBZcahk6ckSXh/W9Uma3u', 2, 'Arjun Sharma', 'arjun.sharma@campusnest.edu', '+91 9876500001', TRUE, TRUE),
(3, 'STU2026002', '$2a$10$NumH1LnmzI7zg7Lb6hrgtOPx54wyOhVBMEY7oZR051vhbemNio2bq', 2, 'Priya Patel', 'priya.patel@campusnest.edu', '+91 9876500002', TRUE, FALSE),
(4, 'STU2026003', '$2a$10$NumH1LnmzI7zg7Lb6hrgtOPx54wyOhVBMEY7oZR051vhbemNio2bq', 2, 'Rohan Verma', 'rohan.verma@campusnest.edu', '+91 9876500003', TRUE, FALSE),
(5, 'STU2026004', '$2a$10$NumH1LnmzI7zg7Lb6hrgtOPx54wyOhVBMEY7oZR051vhbemNio2bq', 2, 'Sneha Reddy', 'sneha.reddy@campusnest.edu', '+91 9876500004', TRUE, FALSE),
(6, 'STU2026005', '$2a$10$NumH1LnmzI7zg7Lb6hrgtOPx54wyOhVBMEY7oZR051vhbemNio2bq', 2, 'Kavya Nair', 'kavya.nair@campusnest.edu', '+91 9876500005', TRUE, FALSE),
(7, 'FAC2026001', '$2a$10$fClVEjZIB2wBhZwlDNHRcusjgGBlFkNHiJ1x61SRKTI6QI.rWM7jC', 3, 'Dr. Rajesh Kumar', 'dr.rajesh.kumar@campusnest.edu', '+91 9876510001', TRUE, FALSE),
(8, 'FAC2026002', '$2a$10$fClVEjZIB2wBhZwlDNHRcusjgGBlFkNHiJ1x61SRKTI6QI.rWM7jC', 3, 'Prof. Anita Deshmukh', 'anita.deshmukh@campusnest.edu', '+91 9876510002', TRUE, FALSE),
(12, 'LIB2026001', '$2a$10$IAwqvrACPmZo7x6ki2xA1.6LqvNNVwy0dmLcuNutYAipSFDet3Gdu', 4, 'Mrs. Savitha Deshmukh', 'librarian@campusnest.edu', '+91 9876543220', TRUE, FALSE)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 4. Insert Students
INSERT INTO students (id, user_id, registration_number, department, course, academic_year, semester, section, date_of_birth) VALUES
(1, 2, 'STU2026001', 'Computer Science & Engineering', 'B.Tech CSE', 'Third Year', 6, 'A', '2006-08-15'),
(2, 3, 'STU2026002', 'Information Technology', 'B.Tech IT', 'Third Year', 5, 'B', '2005-11-22'),
(3, 4, 'STU2026003', 'Electronics & Communication', 'B.Tech ECE', 'Second Year', 4, 'A', '2006-04-10'),
(4, 5, 'STU2026004', 'Computer Science & Engineering', 'B.Tech CSE', 'First Year', 2, 'A', '2005-09-05'),
(5, 6, 'STU2026005', 'Artificial Intelligence & Data Science', 'B.Tech AI & DS', 'Fourth Year', 7, 'C', '2006-12-12')
ON DUPLICATE KEY UPDATE registration_number=VALUES(registration_number);

-- 5. Insert Faculty
INSERT INTO faculty (id, user_id, employee_id, department, designation, joining_date) VALUES
(1, 7, 'FAC2026001', 'Computer Science & Engineering', 'Professor & Head of Department', '2018-07-01'),
(2, 8, 'FAC2026002', 'Information Technology', 'Associate Professor', '2020-01-15')
ON DUPLICATE KEY UPDATE employee_id=VALUES(employee_id);

-- 6. Insert Categories
INSERT INTO categories (id, name, description) VALUES
(1, 'Java Programming', 'Core Java, Enterprise Java, JVM internals, and frameworks'),
(2, 'Python Programming', 'Python scripting, scientific computing, and web frameworks'),
(3, 'C and C++', 'Systems programming, modern C++, performance optimization'),
(4, 'Data Structures and Algorithms', 'Algorithm design, analysis, computational complexity'),
(5, 'Artificial Intelligence', 'Search algorithms, reasoning, multi-agent systems'),
(6, 'Machine Learning', 'Supervised, unsupervised learning, statistical modeling'),
(7, 'Deep Learning', 'Neural networks, PyTorch, TensorFlow, computer vision, NLP'),
(8, 'Database Management Systems', 'Relational DBs, SQL, indexing, NoSQL, transaction theory'),
(9, 'Computer Networks', 'TCP/IP protocol suite, network security, routing, SDN'),
(10, 'Operating Systems', 'Kernel architecture, virtualization, memory and process management'),
(11, 'Software Engineering', 'Design patterns, Agile, software testing, system design'),
(12, 'Web Development', 'Full-stack development, modern frontend, RESTful APIs'),
(13, 'Cybersecurity', 'Cryptography, network defense, ethical hacking, malware analysis'),
(14, 'Cloud Computing', 'AWS, Azure, Kubernetes, cloud architectures, microservices'),
(15, 'Mathematics', 'Discrete mathematics, linear algebra, probability and statistics'),
(16, 'Physics', 'Classical mechanics, electromagnetism, semiconductor physics'),
(17, 'Electronics', 'Digital logic, microcontrollers, embedded systems, VLSI'),
(18, 'Business and Management', 'Tech entrepreneurship, project management, financial management'),
(19, 'Literature and General Reading', 'Classic literature, history of computing, philosophy'),
(20, 'Competitive Examination Preparation', 'GATE CSE, GRE, coding interview masterclasses')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 7. Insert Books (>= 100 Books across 20 Categories)
INSERT INTO books (id, isbn, title, author, category_id, publisher, publication_year, description, total_copies, available_copies, cover_image) VALUES
(1, '978-0-100317-7', 'Effective Java (3rd Edition)', 'Joshua Bloch', 1, 'Addison-Wesley', 2018, 'Essential best practices for the Java platform covering modern language patterns.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(2, '978-0-100634-4', 'Java: The Complete Reference (12th Edition)', 'Herbert Schildt', 1, 'McGraw-Hill', 2021, 'Comprehensive guide to the Java language, standard libraries, and concurrency utilities.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(3, '978-0-100951-1', 'Spring in Action (6th Edition)', 'Craig Walls', 1, 'Manning', 2022, 'Hands-on guide to building modern enterprise applications with Spring Boot 3.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(4, '978-0-101268-8', 'Java Concurrency in Practice', 'Brian Goetz', 1, 'Addison-Wesley', 2006, 'The definitive guide to multithreading, safety, and performance in Java.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(5, '978-0-101585-5', 'Core Java Volume I – Fundamentals', 'Cay S. Horstmann', 1, 'Prentice Hall', 2022, 'Deep dive into object-oriented design, reflection, and collections in Java.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(6, '978-0-101902-2', 'Mastering Spring Boot 3.0', 'Dinesh Rajput', 1, 'Packt', 2023, 'Advanced techniques for building cloud-native microservices with Spring Boot.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(7, '978-0-102219-9', 'Fluent Python: Clear, Concise, and Effective', 'Luciano Ramalho', 2, 'O''Reilly Media', 2022, 'Take your Python beyond basics into idiomatic, fast, and modern Python 3.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(8, '978-0-102536-6', 'Python Crash Course (3rd Edition)', 'Eric Matthes', 2, 'No Starch Press', 2023, 'A fast-paced, project-based introduction to programming in Python.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(9, '978-0-102853-3', 'Learning Python (5th Edition)', 'Mark Lutz', 2, 'O''Reilly Media', 2013, 'Comprehensive tutorial on Python syntax, data types, and modular architecture.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(10, '978-0-103170-0', 'Python Cookbook: Recipes for Mastering Python 3', 'David Beazley, Brian K. Jones', 2, 'O''Reilly Media', 2013, 'Practical recipes covering algorithms, data structures, and network programming.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(11, '978-0-103487-7', 'Automate the Boring Stuff with Python', 'Al Sweigart', 2, 'No Starch Press', 2019, 'Practical programming for total beginners to automate repetitive daily tasks.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(12, '978-0-103804-4', 'The C Programming Language (2nd Edition)', 'Brian W. Kernighan, Dennis M. Ritchie', 3, 'Prentice Hall', 1988, 'The classic canonical reference on C language syntax, pointers, and memory.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(13, '978-0-104121-1', 'The C++ Programming Language (4th Edition)', 'Bjarne Stroustrup', 3, 'Addison-Wesley', 2013, 'Definitive guide to modern C++ by the creator of the language.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(14, '978-0-104438-8', 'Effective Modern C++', 'Scott Meyers', 3, 'O''Reilly Media', 2014, '42 specific ways to improve your use of C++11 and C++14.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(15, '978-0-104755-5', 'C++ Primer (5th Edition)', 'Stanley B. Lippman, Josée Lajoie', 3, 'Addison-Wesley', 2012, 'Authoritative and comprehensive introduction to C++ and its standard library.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(16, '978-0-105072-2', 'Expert C Programming: Deep C Secrets', 'Peter van der Linden', 3, 'Prentice Hall', 1994, 'Advanced exploration of C quirks, pointers, linker behavior, and history.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(17, '978-0-105389-9', 'Introduction to Algorithms (CLRS 4th Edition)', 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', 4, 'MIT Press', 2022, 'The gold-standard reference for rigorous algorithmic study and proofs.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(18, '978-0-105706-6', 'The Algorithm Design Manual (3rd Edition)', 'Steven S. Skiena', 4, 'Springer', 2020, 'Practical guide to algorithmic problem solving with war stories and catalog.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(19, '978-0-106023-3', 'Data Structures and Algorithms in Java (6th Edition)', 'Michael T. Goodrich, Roberto Tamassia', 4, 'Wiley', 2014, 'Comprehensive coverage of OOP-based data structures and algorithmic efficiency.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(20, '978-0-106340-0', 'Algorithms (4th Edition)', 'Robert Sedgewick, Kevin Wayne', 4, 'Addison-Wesley', 2011, 'Surveys the most important computer algorithms in use today with Java code.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(21, '978-0-106657-7', 'Grokking Algorithms', 'Aditya Bhargava', 4, 'Manning', 2016, 'An illustrated, friendly guide for learning fundamental algorithms visually.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(22, '978-0-106974-4', 'Competitive Programming 4', 'Steven Halim, Felix Halim', 4, 'Lulu', 2020, 'Advanced techniques and data structures for competitive programming contests.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(23, '978-0-107291-1', 'Artificial Intelligence: A Modern Approach (4th Edition)', 'Stuart Russell, Peter Norvig', 5, 'Pearson', 2020, 'The leading textbook in AI, covering rational agents, logic, and probabilistic reasoning.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(24, '978-0-107608-8', 'Artificial Intelligence: Foundations of Computational Agents', 'David L. Poole, Alan K. Mackworth', 5, 'Cambridge University Press', 2017, 'Principled approach to AI focusing on intelligent agent design.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(25, '978-0-107925-5', 'Reinforcement Learning: An Introduction (2nd Edition)', 'Richard S. Sutton, Andrew G. Barto', 5, 'MIT Press', 2018, 'Foundational text on MDPs, temporal difference learning, and policy gradients.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(26, '978-0-108242-2', 'Pattern Recognition and Machine Learning', 'Christopher M. Bishop', 5, 'Springer', 2006, 'Comprehensive Bayesian perspective on pattern recognition and statistical learning.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(27, '978-0-108559-9', 'Knowledge Representation and Reasoning', 'Ronald Brachman, Hector Levesque', 5, 'Morgan Kaufmann', 2004, 'Formal methods for symbolic logic, ontologies, and automated reasoning.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(28, '978-0-108876-6', 'Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow (3rd Edition)', 'Aurélien Géron', 6, 'O''Reilly Media', 2022, 'Concrete code examples and minimal theory to build end-to-end ML systems.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(29, '978-0-109193-3', 'The Elements of Statistical Learning (2nd Edition)', 'Trevor Hastie, Robert Tibshirani, Jerome Friedman', 6, 'Springer', 2009, 'Advanced mathematical treatment of supervised and unsupervised learning.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(30, '978-0-109510-0', 'Machine Learning: A Probabilistic Perspective', 'Kevin P. Murphy', 6, 'MIT Press', 2012, 'Comprehensive self-contained introduction to statistical machine learning.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(31, '978-0-109827-7', 'An Introduction to Statistical Learning', 'Gareth James, Daniela Witten, Trevor Hastie, Robert Tibshirani', 6, 'Springer', 2021, 'Accessible overview of statistical modeling with practical applications.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(32, '978-0-110144-4', 'Designing Machine Learning Systems', 'Chip Huyen', 6, 'O''Reilly Media', 2022, 'Holistic system design for reliable, scalable production ML pipelines.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(33, '978-0-110461-1', 'Deep Learning', 'Ian Goodfellow, Yoshua Bengio, Aaron Courville', 7, 'MIT Press', 2016, 'Comprehensive foundational textbook on modern deep neural architectures.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(34, '978-0-110778-8', 'Deep Learning with PyTorch', 'Eli Stevens, Luca Antiga, Thomas Viehmann', 7, 'Manning', 2020, 'Practical guide to building neural networks and computer vision models with PyTorch.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(35, '978-0-111095-5', 'Deep Learning for Coders with fastai and PyTorch', 'Jeremy Howard, Sylvain Gugger', 7, 'O''Reilly Media', 2020, 'Top-down approach to mastering state-of-the-art computer vision and NLP models.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(36, '978-0-111412-2', 'Natural Language Processing with Transformers', 'Lewis Tunstall, Leandro von Werra, Thomas Wolf', 7, 'O''Reilly Media', 2022, 'Building BERT, GPT, and modern transformer architectures with Hugging Face.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(37, '978-0-111729-9', 'Generative Deep Learning (2nd Edition)', 'David Foster', 7, 'O''Reilly Media', 2023, 'Comprehensive handbook for VAEs, GANs, Diffusion Models, and LLMs.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(38, '978-0-112046-6', 'Database System Concepts (7th Edition)', 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan', 8, 'McGraw-Hill', 2019, 'The definitive text on database internals, relational algebra, and concurrency.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(39, '978-0-112363-3', 'Designing Data-Intensive Applications', 'Martin Kleppmann', 8, 'O''Reilly Media', 2017, 'The essential architecture guide to reliability, scalability, and maintainability in data systems.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(40, '978-0-112680-0', 'High Performance MySQL (4th Edition)', 'Silvia Botros, Jeremy Tinley', 8, 'O''Reilly Media', 2021, 'Optimization, replication, indexing strategies, and scaling MySQL in production.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(41, '978-0-112997-7', 'Fundamentals of Database Systems (7th Edition)', 'Ramez Elmasri, Shamkant B. Navathe', 8, 'Pearson', 2015, 'In-depth introduction to relational modeling, normal forms, and query processing.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(42, '978-0-113314-4', 'SQL Antipatterns: Avoiding the Pitfalls of Database Programming', 'Bill Karwin', 8, 'Pragmatic Bookshelf', 2010, 'How to avoid common database schema and query design blunders.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(43, '978-0-113631-1', 'Computer Networking: A Top-Down Approach (8th Edition)', 'James F. Kurose, Keith W. Ross', 9, 'Pearson', 2020, 'The leading top-down pedagogy covering application layer down to physical link.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(44, '978-0-113948-8', 'Computer Networks (6th Edition)', 'Andrew S. Tanenbaum, Nick Feamster, David J. Wetherall', 9, 'Pearson', 2021, 'Classic comprehensive review of network hardware, protocols, and security.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(45, '978-0-114265-5', 'TCP/IP Illustrated, Volume 1: The Protocols', 'W. Richard Stevens, Kevin R. Fall', 9, 'Addison-Wesley', 2011, 'Unmatched deep packet-level analysis of core internet protocols.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(46, '978-0-114582-2', 'Network Warrior (2nd Edition)', 'Gary A. Donahue', 9, 'O''Reilly Media', 2011, 'Everything you need to know about enterprise Cisco routers, switches, and firewalls.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(47, '978-0-114899-9', 'Software-Defined Networking: A Systems Approach', 'Larry Peterson, Carmelo Cascone', 9, 'Systems Approach LLC', 2021, 'Modern programmable data planes, OpenFlow, and cloud network architectures.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(48, '978-0-115216-6', 'Operating System Concepts (10th Edition)', 'Abraham Silberschatz, Peter B. Galvin, Greg Gagne', 10, 'Wiley', 2018, 'The classic dinosaur book covering processes, threads, memory, and storage.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(49, '978-0-115533-3', 'Modern Operating Systems (5th Edition)', 'Andrew S. Tanenbaum, Herbert Bos', 10, 'Pearson', 2022, 'Comprehensive survey of operating systems principles, multicore, and virtualization.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(50, '978-0-115850-0', 'Operating Systems: Three Easy Pieces', 'Remzi H. Arpaci-Dusseau, Andrea C. Arpaci-Dusseau', 10, 'Arpaci-Dusseau Books', 2018, 'Masterclass on virtualization, concurrency, and persistence with clear code.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(51, '978-0-116167-7', 'Linux Kernel Development (3rd Edition)', 'Robert Love', 10, 'Addison-Wesley', 2010, 'Design and implementation of the Linux kernel, subsystems, and device drivers.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(52, '978-0-116484-4', 'The Design of the UNIX Operating System', 'Maurice J. Bach', 10, 'Prentice Hall', 1986, 'Pioneering analysis of the internal algorithms and data structures of UNIX.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(53, '978-0-116801-1', 'Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 11, 'Prentice Hall', 2008, 'Principles and best practices for writing readable, maintainable, high-quality code.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(54, '978-0-117118-8', 'Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides', 11, 'Addison-Wesley', 1994, 'The Gang of Four classic establishing 23 core architectural design patterns.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(55, '978-0-117435-5', 'Refactoring: Improving the Design of Existing Code (2nd Edition)', 'Martin Fowler', 11, 'Addison-Wesley', 2018, 'Disciplined technique for restructuring existing body of code without changing external behavior.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(56, '978-0-117752-2', 'Software Engineering (10th Edition)', 'Ian Sommerville', 11, 'Pearson', 2015, 'Comprehensive text on software process models, requirements, and dependability.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(57, '978-0-118069-9', 'Building Microservices (2nd Edition)', 'Sam Newman', 11, 'O''Reilly Media', 2021, 'Comprehensive guide to modeling, integrating, testing, and deploying microservices.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(58, '978-0-118386-6', 'System Design Interview – An Insider’s Guide (Vol 1)', 'Alex Xu', 11, 'Independently Published', 2020, 'Clear step-by-step framework to solving large-scale distributed system challenges.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(59, '978-0-118703-3', 'Eloquent JavaScript (3rd Edition)', 'Marijn Haverbeke', 12, 'No Starch Press', 2018, 'Modern introduction to programming, JavaScript language mechanics, and the browser DOM.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(60, '978-0-119020-0', 'Full Stack Development with Spring Boot 3 and React (4th Edition)', 'Juha Hinkula', 12, 'Packt', 2023, 'Build modern, secure web applications integrating React and Spring Boot.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(61, '978-0-119337-7', 'Learning React: Modern Patterns for Developing React Apps (2nd Edition)', 'Alex Banks, Eve Porcello', 12, 'O''Reilly Media', 2020, 'Functional programming patterns, React Hooks, and state management.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(62, '978-0-119654-4', 'You Don''t Know JS Yet: Get Started', 'Kyle Simpson', 12, 'Independently Published', 2020, 'Deep dive into the core mechanisms of JavaScript closures, scopes, and coercion.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(63, '978-0-119971-1', 'Pro ASP.NET Core 7 (10th Edition)', 'Adam Freeman', 12, 'Apress', 2023, 'Professional guide to building REST APIs and web services using .NET 7.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(64, '978-0-120288-8', 'The Web Application Hacker’s Handbook (2nd Edition)', 'Dafydd Stuttard, Marcus Pinto', 13, 'Wiley', 2011, 'Finding and exploiting security flaws in modern web applications.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(65, '978-0-120605-5', 'Practical Malware Analysis', 'Michael Sikorski, Andrew Honig', 13, 'No Starch Press', 2012, 'Hands-on guide to dissecting malicious software using IDA Pro and OllyDbg.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(66, '978-0-120922-2', 'Cryptography and Network Security (8th Edition)', 'William Stallings', 13, 'Pearson', 2020, 'Mathematical foundations of symmetric ciphers, RSA, elliptic curves, and TLS.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(67, '978-0-121239-9', 'Hacking: The Art of Exploitation (2nd Edition)', 'Jon Erickson', 13, 'No Starch Press', 2008, 'Fundamentals of buffer overflows, shellcode, and network vulnerability analysis.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(68, '978-0-121556-6', 'Blue Team Handbook: Incident Response Edition', 'Don Murdoch', 13, 'CreateSpace', 2014, 'Essential operational field guide for cybersecurity defenders and SOC analysts.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(69, '978-0-121873-3', 'Cloud Native Patterns: Designing change-tolerant software', 'Cornelia Davis', 14, 'Manning', 2019, 'Patterns for resilient, decoupled cloud services on distributed platforms.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(70, '978-0-122190-0', 'Kubernetes: Up and Running (3rd Edition)', 'Brendan Burns, Joe Beda, Kelsey Hightower, Lachlan Evenson', 14, 'O''Reilly Media', 2022, 'Dive into container orchestration from the original Kubernetes creators.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(71, '978-0-122507-7', 'Terraform: Up & Running (3rd Edition)', 'Yevgeniy Brikman', 14, 'O''Reilly Media', 2022, 'Writing infrastructure as code across multi-cloud environments cleanly.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(72, '978-0-122824-4', 'AWS Certified Solutions Architect Official Study Guide', 'Joe Baron, Hisham Baz, Tim Bixler', 14, 'Sybex', 2021, 'Comprehensive architecture patterns on AWS IAM, VPC, EC2, S3, and RDS.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(73, '978-0-123141-1', 'Docker Deep Dive', 'Nigel Poulton', 14, 'Independently Published', 2023, 'Clear, comprehensive explanation of containers, images, and Docker engines.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(74, '978-0-123458-8', 'Discrete Mathematics and Its Applications (8th Edition)', 'Kenneth H. Rosen', 15, 'McGraw-Hill', 2019, 'Fundamental textbook for combinatorics, graph theory, and proof techniques.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(75, '978-0-123775-5', 'Linear Algebra and Its Applications (5th Edition)', 'David C. Lay, Steven R. Lay, Judi J. McDonald', 15, 'Pearson', 2015, 'Core linear algebra concepts, eigenvalues, and matrix transformations.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(76, '978-0-124092-2', 'Introduction to Probability (2nd Edition)', 'Dimitri P. Bertsekas, John N. Tsitsiklis', 15, 'Athena Scientific', 2008, 'Rigorous introduction to probabilistic models, conditional density, and Markov chains.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(77, '978-0-124409-9', 'Thomas’ Calculus (14th Edition)', 'Joel R. Hass, Christopher E. Heil, Maurice D. Weir', 15, 'Pearson', 2018, 'Classic calculus textbook covering multivariable integration and vector fields.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(78, '978-0-124726-6', 'Concrete Mathematics: A Foundation for Computer Science', 'Ronald L. Graham, Donald E. Knuth, Oren Patashnik', 15, 'Addison-Wesley', 1994, 'Deep blend of continuous and discrete mathematics for serious computer scientists.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(79, '978-0-125043-3', 'Halliday & Resnick Fundamentals of Physics (11th Edition)', 'David Halliday, Robert Resnick, Jearl Walker', 16, 'Wiley', 2018, 'The gold-standard calculus-based physics text for engineering students.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(80, '978-0-125360-0', 'University Physics with Modern Physics (15th Edition)', 'Hugh D. Young, Roger A. Freedman', 16, 'Pearson', 2019, 'In-depth treatment of mechanics, electromagnetism, and quantum physics.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(81, '978-0-125677-7', 'Introduction to Electrodynamics (4th Edition)', 'David J. Griffiths', 16, 'Cambridge University Press', 2017, 'Standard undergraduate textbook on Maxwell equations, potentials, and waves.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(82, '978-0-125994-4', 'Semiconductor Physics and Devices (4th Edition)', 'Donald A. Neamen', 16, 'McGraw-Hill', 2012, 'Quantum mechanics applied to PN junctions, MOSFETs, and bipolar transistors.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(83, '978-0-126311-1', 'Solid State Physics', 'Neil W. Ashcroft, N. David Mermin', 16, 'Cengage Learning', 1976, 'Authoritative reference on crystal lattices, electron bands, and semiconductors.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(84, '978-0-126628-8', 'The Art of Electronics (3rd Edition)', 'Paul Horowitz, Winfield Hill', 17, 'Cambridge University Press', 2015, 'The indisputable bible of practical analog and digital circuit design.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(85, '978-0-126945-5', 'Digital Design: With an Introduction to the Verilog HDL (6th Edition)', 'M. Morris Mano, Michael D. Ciletti', 17, 'Pearson', 2018, 'Logic gates, Boolean algebra, synchronous sequential circuits, and HDL.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(86, '978-0-127262-2', 'Microelectronic Circuits (8th Edition)', 'Adel S. Sedra, Kenneth C. Smith', 17, 'Oxford University Press', 2020, 'The definitive text on analog integrated circuits, op-amps, and amplifiers.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(87, '978-0-127579-9', 'Embedded Systems: Introduction to ARM Cortex-M Microcontrollers', 'Jonathan W. Valvano', 17, 'CreateSpace', 2014, 'Hands-on embedded engineering covering interrupts, timers, and ADC interfaces.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(88, '978-0-127896-6', 'CMOS VLSI Design: A Circuits and Systems Perspective (4th Edition)', 'Neil Weste, David Harris', 17, 'Addison-Wesley', 2010, 'Deep exploration of modern CMOS chip design, layout, and timing.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(89, '978-0-128213-3', 'The Lean Startup', 'Eric Ries', 18, 'Crown Business', 2011, 'How modern entrepreneurs use continuous innovation to create radically successful businesses.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(90, '978-0-128530-0', 'Zero to One: Notes on Startups, or How to Build the Future', 'Peter Thiel, Blake Masters', 18, 'Crown Business', 2014, 'Contrarian philosophy on monopoly innovation, defensibility, and building unique companies.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(91, '978-0-128847-7', 'Measure What Matters: OKRs', 'John Doerr', 18, 'Portfolio', 2018, 'How Google, Bono, and the Gates Foundation shake up the world with Objectives and Key Results.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(92, '978-0-129164-4', 'Principles: Life and Work', 'Ray Dalio', 18, 'Simon & Schuster', 2017, 'Unconventional principles for radical transparency and systematic decision-making.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(93, '978-0-129481-1', 'Project Management: A Systems Approach (13th Edition)', 'Harold Kerzner', 18, 'Wiley', 2022, 'The comprehensive body of knowledge for enterprise project lifecycle management.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(94, '978-0-129798-8', 'The Pragmatic Programmer: 20th Anniversary Edition', 'David Thomas, Andrew Hunt', 19, 'Addison-Wesley', 2019, 'Timeless philosophy, career advice, and craftsmanship principles for software engineers.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(95, '978-0-130115-5', 'The Mythical Man-Month: Essays on Software Engineering', 'Frederick P. Brooks Jr.', 19, 'Addison-Wesley', 1995, 'Essential essays on team management, Brooks’s Law, and project scheduling.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(96, '978-0-130432-2', 'Gödel, Escher, Bach: An Eternal Golden Braid', 'Douglas R. Hofstadter', 19, 'Basic Books', 1979, 'A metaphorical exploration of minds, formal systems, self-reference, and art.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(97, '978-0-130749-9', 'Hackers: Heroes of the Computer Revolution', 'Steven Levy', 19, 'O''Reilly Media', 2010, 'Chronicles the pioneering rebels from MIT labs to early Silicon Valley garages.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(98, '978-0-131066-6', 'Steve Jobs', 'Walter Isaacson', 19, 'Simon & Schuster', 2011, 'The definitive biography of the visionary co-founder of Apple Inc.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(99, '978-0-131383-3', 'GATE Computer Science & Information Technology', 'Trishna Knowledge Systems', 20, 'Pearson', 2023, 'Comprehensive topic-wise theory, practice questions, and previous year solutions for GATE CSE.', 8, 8, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(100, '978-0-131700-0', 'Cracking the Coding Interview (6th Edition)', 'Gayle Laakmann McDowell', 20, 'CareerCup', 2015, '189 programming questions and solutions covering data structures, algorithms, and system design.', 4, 4, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(101, '978-0-132017-7', 'Quantitative Aptitude for Competitive Examinations', 'R.S. Aggarwal', 20, 'S. Chand Publishing', 2022, 'The benchmark practice textbook for mathematical aptitude and problem solving.', 5, 5, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(102, '978-0-132334-4', 'A Modern Approach to Verbal & Non-Verbal Reasoning', 'R.S. Aggarwal', 20, 'S. Chand Publishing', 2022, 'Complete study material for analytical reasoning and competitive recruitment exams.', 6, 6, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60'),
(103, '978-0-132651-1', 'GATE 2024 Chapterwise Previous Solved Papers CSE', 'Made Easy Editorial Board', 20, 'Made Easy Publications', 2023, 'Solved papers with step-by-step analytical explanations spanning past 30 years of GATE.', 7, 7, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=60')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. Insert Borrow Transactions
-- Scenario dates relative to current date (approx Oct 2026):
-- T1: Book 1 borrowed by Arjun Sharma (STU2026001 / User 2), returned on-time (Fine 0)
-- T2: Book 2 borrowed by Arjun Sharma (STU2026001 / User 2), returned 4 days late (Fine 20.00, Paid 20.00)
-- T3: Book 3 borrowed by Priya Patel (STU2026002 / User 3), returned 6 days late (Fine 30.00, Paid 10.00, Balance 20.00)
-- T4: Book 4 borrowed by Arjun Sharma (STU2026001 / User 2), ISSUED, due in 2 days (Eligible for 2-day reminder)
-- T5: Book 7 borrowed by Arjun Sharma (STU2026001 / User 2), ISSUED, due today
-- T6: Book 12 borrowed by Priya Patel (STU2026002 / User 3), ISSUED, OVERDUE by 5 days (Unreturned estimated fine)
-- T7: Book 18 borrowed by Dr. Rajesh Kumar (FAC2026001 / User 7), ISSUED, active within due date
-- T8: Book 24 borrowed by Rohan Verma (STU2026003 / User 4), ISSUED, OVERDUE by 3 days

INSERT INTO borrow_transactions (id, book_id, user_id, issue_date, due_date, return_date, status, issued_by_admin_id, fine_amount, overdue_days, notes) VALUES
(1, 1, 2, '2026-09-01', '2026-09-15', '2026-09-14', 'RETURNED', 1, 0.00, 0, 'Returned in pristine condition'),
(2, 2, 2, '2026-09-05', '2026-09-19', '2026-09-23', 'RETURNED', 1, 20.00, 4, 'Returned 4 days late. Fine cleared.'),
(3, 3, 3, '2026-09-10', '2026-09-24', '2026-09-30', 'RETURNED', 1, 30.00, 6, 'Returned 6 days late. Partial payment of 10 INR recorded.'),
(4, 4, 2, '2026-09-28', '2026-10-12', NULL, 'ISSUED', 1, 0.00, 0, 'Active issue. Due in 2 days.'),
(5, 7, 2, '2026-09-26', '2026-10-10', NULL, 'ISSUED', 1, 0.00, 0, 'Active issue. Due today.'),
(6, 12, 3, '2026-09-20', '2026-10-05', NULL, 'OVERDUE', 1, 25.00, 5, 'Unreturned overdue book. Current estimated fine: 25 INR.'),
(7, 18, 7, '2026-09-15', '2026-10-15', NULL, 'ISSUED', 1, 0.00, 0, 'Faculty borrowing for semester research.'),
(8, 24, 4, '2026-09-22', '2026-10-07', NULL, 'OVERDUE', 1, 15.00, 3, 'Overdue book.')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Update available copies for currently issued books (books 4, 7, 12, 18, 24)
UPDATE books SET available_copies = total_copies - 1 WHERE id IN (4, 7, 12, 18, 24);

-- 9. Insert Assessed Fines (for returned transactions T2 and T3)
INSERT INTO fines (id, transaction_id, user_id, overdue_days, daily_rate, fine_amount, paid_amount, balance_amount, status) VALUES
(1, 2, 2, 4, 5.00, 20.00, 20.00, 0.00, 'PAID'),
(2, 3, 3, 6, 5.00, 30.00, 10.00, 20.00, 'PARTIALLY_PAID')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Insert Fine Payments
INSERT INTO fine_payments (id, fine_id, amount_paid, payment_date, payment_method, receipt_number, received_by_admin_id, notes) VALUES
(1, 1, 20.00, '2026-09-23 11:30:00', 'CASH', 'REC-2026-001', 1, 'Full fine settlement at central circulation desk'),
(2, 2, 10.00, '2026-09-30 14:15:00', 'UPI', 'REC-2026-002', 1, 'Partial cash/UPI payment. Remaining balance 20 INR')
ON DUPLICATE KEY UPDATE receipt_number=VALUES(receipt_number);

-- 11. Insert Academic Projects & Assignments
INSERT INTO projects (id, faculty_id, title, description, department, course, start_date, due_date, status) VALUES
(1, 1, 'Distributed Key-Value Store Implementation', 'Implement a Raft-replicated in-memory key-value store in Java or C++. Must support leader election, log replication, and client consistency guarantees.', 'Computer Science & Engineering', 'B.Tech CSE', '2026-09-20', '2026-10-12', 'ACTIVE'),
(2, 1, 'Convolutional Neural Networks for Chest X-Ray Diagnosis', 'Build, train, and evaluate a CNN architecture on the NIH Chest X-Ray dataset. Report sensitivity, specificity, ROC curves, and Grad-CAM visualizations.', 'Computer Science & Engineering', 'B.Tech CSE', '2026-09-25', '2026-10-20', 'ACTIVE'),
(3, 2, 'Cloud-Native Microservices with Spring Boot & Docker', 'Design a scalable multi-container library catalog and reservation service. Include OpenTelemetry tracing, Prometheus metrics, and automated GitHub CI/CD workflow.', 'Information Technology', 'B.Tech IT', '2026-09-22', '2026-10-15', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 12. Insert Project Submissions
INSERT INTO project_submissions (id, project_id, student_id, submission_date, submission_text, file_name, file_size, status, grade, feedback) VALUES
(1, 1, 1, '2026-10-09 18:20:00', 'Completed full Raft consensus implementation in Java 21 with JUnit tests for cluster partition recovery. GitHub repo included in submission report.', 'raft_kv_arjun_sharma.pdf', 2450000, 'SUBMITTED', NULL, NULL),
(2, 3, 2, '2026-10-08 16:45:00', 'Implemented Spring Boot 3 microservices with PostgreSQL, Docker Compose, and automated health checks.', 'cloud_microservices_priya.zip', 5120000, 'REVIEWED', 'A+', 'Outstanding work on circuit breakers and resilience patterns!')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 13. Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, reference_id, reference_type, is_read, created_at) VALUES
(1, 2, 'Book Return Reminder: Due in 2 Days', 'Your borrowed book "Algorithms (4th Edition)" is due on October 12, 2026. Please return it by the due date to avoid overdue fines.', 'BOOK_RETURN_REMINDER_2DAYS', 4, 'BORROW_TRANSACTION', FALSE, '2026-10-10 08:00:00'),
(2, 2, 'Academic Project Due in 2 Days', 'Reminder: Your submission for "Distributed Key-Value Store Implementation" is due on October 12, 2026.', 'PROJECT_DEADLINE_2DAYS', 1, 'PROJECT', FALSE, '2026-10-10 08:30:00'),
(3, 3, 'Outstanding Overdue Fine Alert', 'You have an outstanding fine balance of INR 20.00 for "Java Concurrency in Practice". Please settle at the circulation counter.', 'FINE_ASSESSED', 2, 'FINE', FALSE, '2026-10-01 10:00:00'),
(4, 3, 'Book Overdue Alert', 'Your borrowed book "Clean Code" was due on October 05, 2026. A daily fine of INR 5.00 is currently accumulating.', 'BOOK_OVERDUE', 6, 'BORROW_TRANSACTION', FALSE, '2026-10-06 09:00:00')
ON DUPLICATE KEY UPDATE title=VALUES(title);
