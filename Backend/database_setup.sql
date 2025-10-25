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
-- Insert data - Real Karunya University Users
-- Note: Passwords are stored as plain text here.
-- If using Django backend, run seed_data command instead for proper hashing.
-- ============================================================================

-- Insert Students (Real Karunya University Students)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, is_staff, is_superuser)
VALUES
    (gen_random_uuid(), 'urk23ai1090', 'gokulp@karunya.edu.in', 'student123', 'Gokul', 'P', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'urk23ai1103', 'niranjant@karunya.edu.in', 'student123', 'Niranjan', 'T', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'urk23ai1072', 'dicksone@karunya.edu.in', 'student123', 'Dickson', 'E', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'urk23ai1046', 'earnestkirubakaran@karunya.edu.in', 'student123', 'Earnest', 'Kirubakaran', 'Student', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'urk23ai1082', 'ariesnathya@karunya.edu.in', 'student123', 'Aries', 'Nathya', 'Student', TRUE, FALSE, FALSE);

-- Insert Faculty Users (Real Karunya University Faculty)
INSERT INTO users (id, username, email, password, first_name, last_name, role, is_active, is_staff, is_superuser)
VALUES
    (gen_random_uuid(), 'grace.mary', 'dotdev.test@gmail.com', 'faculty123', 'Grace Mary', 'Kanaga', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'antony.taurshia', 'dicksone2006@gmail.com', 'faculty123', 'Antony', 'Taurshia', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'nirmal', 'niranjan2005official@gmail.com', 'faculty123', 'Nirmal', '', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'ebenezer', 'earni8105@gmail.com', 'faculty123', 'Ebenezer', '', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'jenefa', 'ariesnathya@gmail.com', 'faculty123', 'Jenefa', '', 'Faculty', TRUE, FALSE, FALSE),
    (gen_random_uuid(), 'sirija', 'gokulp1806official@gmail.com', 'faculty123', 'Sirija', '', 'Faculty', TRUE, FALSE, FALSE);

-- Create Student Profiles
INSERT INTO students (user_id, student_id, department, year, section)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'gokulp@karunya.edu.in' THEN 'urk23ai1090'
        WHEN u.email = 'niranjant@karunya.edu.in' THEN 'urk23ai1103'
        WHEN u.email = 'dicksone@karunya.edu.in' THEN 'urk23ai1072'
        WHEN u.email = 'earnestkirubakaran@karunya.edu.in' THEN 'urk23ai1046'
        WHEN u.email = 'ariesnathya@karunya.edu.in' THEN 'urk23ai1082'
    END,
    'Computer Science',
    3,  -- Year 3 for all students
    'A'
FROM users u
WHERE u.role = 'Student';

-- Create Faculty Profiles
INSERT INTO faculty (user_id, title, department, is_hod)
SELECT 
    u.id,
    CASE 
        WHEN u.email = 'dotdev.test@gmail.com' THEN 'Professor, Computer Science (HOD)'
        WHEN u.email = 'dicksone2006@gmail.com' THEN 'Assistant Professor, Computer Science'
        WHEN u.email = 'niranjan2005official@gmail.com' THEN 'Assistant Professor, Computer Science'
        WHEN u.email = 'earni8105@gmail.com' THEN 'Assistant Professor, Computer Science'
        WHEN u.email = 'ariesnathya@gmail.com' THEN 'Assistant Professor, Computer Science'
        WHEN u.email = 'gokulp1806official@gmail.com' THEN 'Assistant Professor, Computer Science'
    END,
    'Computer Science',
    CASE 
        WHEN u.email = 'dotdev.test@gmail.com' THEN TRUE  -- Grace Mary Kanaga is HOD
        ELSE FALSE
    END
FROM users u
WHERE u.role = 'Faculty';

-- Insert Sample Attendance Requests
INSERT INTO attendance_requests (student_id, date, periods, event_coordinator, proof_faculty, purpose, status, reason)
SELECT 
    (SELECT id FROM users WHERE email = 'dicksone@karunya.edu.in'),
    CURRENT_DATE - INTERVAL '5 days',
    '[1, 2, 3]'::JSONB,
    'Grace Mary Kanaga',
    'Antony Taurshia',
    'Attending workshop on Artificial Intelligence and Machine Learning technologies',
    'PENDING_MENTOR',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'niranjant@karunya.edu.in'),
    CURRENT_DATE - INTERVAL '3 days',
    '[4, 5, 6, 7]'::JSONB,
    'Nirmal',
    'Ebenezer',
    'Participating in National Level Hackathon organized by Tech University',
    'PENDING_HOD',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'gokulp@karunya.edu.in'),
    CURRENT_DATE - INTERVAL '10 days',
    '[1, 2, 3, 4, 5]'::JSONB,
    'Grace Mary Kanaga',
    'Jenefa',
    'Attending conference on Cloud Computing and DevOps practices',
    'APPROVED',
    NULL
UNION ALL
SELECT 
    (SELECT id FROM users WHERE email = 'earnestkirubakaran@karunya.edu.in'),
    CURRENT_DATE - INTERVAL '7 days',
    '[6, 7, 8]'::JSONB,
    'Sirija',
    'Antony Taurshia',
    'Personal medical appointment scheduled with doctor',
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

SELECT 
    id,
    date,
    periods,
    purpose,
    event_coordinator,
    proof_faculty,
    status,
    created_at,
    updated_at
FROM attendance_requests
ORDER BY created_at DESC;

SELECT 
    ar.id,
    u.first_name || ' ' || u.last_name AS student_name,
    u.email AS student_email,
    ar.date,
    ar.periods,
    ar.purpose,
    ar.event_coordinator,
    ar.status,
    ar.created_at
FROM attendance_requests ar
JOIN users u ON ar.student_id = u.id
ORDER BY ar.created_at DESC;

SELECT 
    status,
    COUNT(*) as total
FROM attendance_requests
GROUP BY status
ORDER BY total DESC;