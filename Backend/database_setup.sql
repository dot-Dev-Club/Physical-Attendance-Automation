-- ============================================================================
-- Physical Attendance Automation - PostgreSQL Database Setup
-- ============================================================================
-- This script creates tables and populates them with test data from mockDatabase.ts
-- Run this in pgAdmin4 Query Tool after creating the database
--
-- Prerequisites:
-- 1. Create database: CREATE DATABASE attendance_db;
-- 2. Connect to attendance_db
-- 3. Run this script
-- ============================================================================

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS attendance_requests CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS faculty CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- USERS TABLE (Base table for authentication)
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(150) UNIQUE NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,  -- Will store hashed passwords in Django
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('Student', 'Faculty')),
    is_active BOOLEAN DEFAULT TRUE,
    is_staff BOOLEAN DEFAULT FALSE,
    is_superuser BOOLEAN DEFAULT FALSE,
    date_joined TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================================
-- FACULTY TABLE (Profile for Faculty users)
-- ============================================================================
CREATE TABLE faculty (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,  -- "Professor", "Associate Professor", etc.
    department VARCHAR(255) NOT NULL,
    is_hod BOOLEAN DEFAULT FALSE,  -- Critical: determines dashboard access
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_faculty_department ON faculty(department);
CREATE INDEX idx_faculty_is_hod ON faculty(is_hod);
CREATE INDEX idx_faculty_user_id ON faculty(user_id);

-- ============================================================================
-- STUDENTS TABLE (Profile for Student users)
-- ============================================================================
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,  -- University student ID
    department VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL CHECK (year >= 1 AND year <= 4),
    section VARCHAR(10),
    mentor_id UUID REFERENCES faculty(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_user_id ON students(user_id);

-- ============================================================================
-- ATTENDANCE REQUESTS TABLE
-- ============================================================================
CREATE TABLE attendance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    periods JSONB NOT NULL,  -- Array of integers [1, 2, 3, 4, 5, 6, 7, 8]
    event_coordinator VARCHAR(255) NOT NULL,
    proof_faculty VARCHAR(255) NOT NULL,
    purpose TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING_MENTOR' 
        CHECK (status IN ('PENDING_MENTOR', 'PENDING_HOD', 'APPROVED', 'DECLINED')),
    reason TEXT,  -- Required when status is DECLINED
    proof_url VARCHAR(500),  -- Optional: URL to uploaded proof document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_attendance_requests_student_id ON attendance_requests(student_id);
CREATE INDEX idx_attendance_requests_status ON attendance_requests(status);
CREATE INDEX idx_attendance_requests_date ON attendance_requests(date);
CREATE INDEX idx_attendance_requests_created_at ON attendance_requests(created_at DESC);
CREATE INDEX idx_attendance_requests_student_status ON attendance_requests(student_id, status);

-- ============================================================================
-- TRIGGERS for updated_at timestamps
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for faculty table
CREATE TRIGGER update_faculty_updated_at BEFORE UPDATE ON faculty
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for students table
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for attendance_requests table
CREATE TRIGGER update_attendance_requests_updated_at BEFORE UPDATE ON attendance_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Insert data from mockDatabase.ts
-- Note: Passwords are stored as plain text here matching mockDatabase.ts exactly.
-- If using Django backend, run seed_data command instead for proper hashing.
-- ============================================================================

-- Insert Students (Plain text passwords from mockDatabase.ts)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, is_staff, is_superuser)
VALUES
    (gen_random_uuid(), 'dickson', 'dickson@university.edu', 'student123', 'Dickson', 'Student', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'niranjan', 'niranjan@university.edu', 'student123', 'Niranjan', 'Kumar', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'gokul', 'gokul@university.edu', 'student123', 'Gokul', 'Raj', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'earnest', 'earnest@university.edu', 'student123', 'Earnest', 'Johnson', 'Student', TRUE, FALSE, FALSE);

-- Insert Faculty Users (Plain text passwords from mockDatabase.ts)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, is_staff, is_superuser)
VALUES
    (gen_random_uuid(), 'evelyn.reed', 'evelyn.reed@university.edu', 'faculty123', 'Evelyn', 'Reed', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'samuel.grant', 'samuel.grant@university.edu', 'faculty123', 'Samuel', 'Grant', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'maria.chen', 'maria.chen@university.edu', 'faculty123', 'Maria', 'Chen', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'ben.carter', 'ben.carter@university.edu', 'faculty123', 'Ben', 'Carter', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'sarah.williams', 'sarah.williams@university.edu', 'faculty123', 'Sarah', 'Williams', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'james.anderson', 'james.anderson@university.edu', 'faculty123', 'James', 'Anderson', 'Faculty', TRUE, FALSE, FALSE);

-- Create Student Profiles
INSERT INTO students (user_id, student_id, department, year, section)
SELECT 
    u.id,
    'STD' || LPAD((ROW_NUMBER() OVER ())::TEXT, 3, '0'),
    CASE 
        WHEN u.email = 'dickson@university.edu' THEN 'Computer Science'
        WHEN u.email = 'niranjan@university.edu' THEN 'Computer Science'
        WHEN u.email = 'gokul@university.edu' THEN 'Computer Science'
        WHEN u.email = 'earnest@university.edu' THEN 'Computer Science'
    END,
    CASE 
        WHEN u.email IN ('dickson@university.edu', 'niranjan@university.edu', 'earnest@university.edu') THEN 3
        WHEN u.email = 'gokul@university.edu' THEN 2
    END,
    'A'
FROM users u
WHERE u.role = 'Student';

-- Create Faculty Profiles
INSERT INTO faculty (user_id, title, department, is_hod)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'evelyn.reed@university.edu' THEN 'Professor, Computer Science'
        WHEN u.email = 'samuel.grant@university.edu' THEN 'Associate Professor, Electronics and Communication'
        WHEN u.email = 'maria.chen@university.edu' THEN 'Professor, Computer Science (HOD)'
        WHEN u.email = 'ben.carter@university.edu' THEN 'Assistant Professor, Electrical Engineering'
        WHEN u.email = 'sarah.williams@university.edu' THEN 'Associate Professor, Computer Science'
        WHEN u.email = 'james.anderson@university.edu' THEN 'Professor, Information Technology (HOD)'
    END,
    CASE 
        WHEN u.email = 'evelyn.reed@university.edu' THEN 'Computer Science'
        WHEN u.email = 'samuel.grant@university.edu' THEN 'Electronics and Communication'
        WHEN u.email = 'maria.chen@university.edu' THEN 'Computer Science'
        WHEN u.email = 'ben.carter@university.edu' THEN 'Electrical Engineering'
        WHEN u.email = 'sarah.williams@university.edu' THEN 'Computer Science'
        WHEN u.email = 'james.anderson@university.edu' THEN 'Information Technology'
    END,
    CASE 
        WHEN u.email IN ('maria.chen@university.edu', 'james.anderson@university.edu') THEN TRUE
        ELSE FALSE
    END
FROM users u
WHERE u.role = 'Faculty';

-- Insert Sample Attendance Requests
INSERT INTO attendance_requests (student_id, date, periods, event_coordinator, proof_faculty, purpose, status, reason)
SELECT 
    (SELECT id FROM users WHERE email = 'dickson@university.edu'),
    CURRENT_DATE - INTERVAL '5 days',
    '[1, 2, 3]'::JSONB,
    'Dr. Smith',
    'Dr. Johnson',
    'Attending workshop on Artificial Intelligence and Machine Learning technologies',
    'PENDING_MENTOR',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'niranjan@university.edu'),
    CURRENT_DATE - INTERVAL '3 days',
    '[4, 5, 6, 7]'::JSONB,
    'Dr. Reed',
    'Dr. Chen',
    'Participating in National Level Hackathon organized by Tech University',
    'PENDING_HOD',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'dickson@university.edu'),
    CURRENT_DATE - INTERVAL '10 days',
    '[1, 2, 3, 4, 5]'::JSONB,
    'Dr. Anderson',
    'Dr. Maria Chen',
    'Attending conference on Cloud Computing and DevOps practices',
    'APPROVED',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'gokul@university.edu'),
    CURRENT_DATE - INTERVAL '7 days',
    '[6, 7, 8]'::JSONB,
    'Dr. Williams',
    'Dr. Brown',
    'Personal medical appointment',
    'DECLINED',
    'Medical appointments do not qualify for event-based attendance exemption';

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Count records in each table
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Faculty', COUNT(*) FROM faculty
UNION ALL
SELECT 'Students', COUNT(*) FROM students
UNION ALL
SELECT 'Attendance Requests', COUNT(*) FROM attendance_requests;

-- ============================================================================
-- DONE! Database setup complete.
-- ============================================================================

COMMENT ON TABLE users IS 'Base authentication table for all users (Students and Faculty)';
COMMENT ON TABLE faculty IS 'Faculty profile with title, department, and HOD flag';
COMMENT ON TABLE students IS 'Student profile with university details';
COMMENT ON TABLE attendance_requests IS 'Physical attendance requests with two-tier approval workflow';

-- Show all users with their roles
SELECT 
    u.email,
    u.first_name || ' ' || u.last_name as name,
    u.role,
    CASE 
        WHEN f.is_hod IS TRUE THEN 'HOD'
        WHEN f.id IS NOT NULL THEN 'Faculty'
        ELSE 'Student'
    END as user_type
FROM users u
LEFT JOIN faculty f ON f.user_id = u.id
ORDER BY u.role, u.email;
