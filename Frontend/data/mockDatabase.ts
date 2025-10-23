/**
 * Mock Database Structure
 * 
 * This file simulates a PostgreSQL database for development.
 * Once the real backend is ready, this will be replaced with actual API calls.
 */

import { Role } from '../types';

// Database Tables Structure

export interface StudentRecord {
    id: string;
    name: string;
    email: string;
    password: string; // In real app, this would be hashed
    role: Role.Student;
    department?: string;
    year?: number;
}

export interface FacultyRecord {
    id: string;
    name: string;
    email: string;
    password: string; // In real app, this would be hashed
    role: Role.Faculty;
    department: string;
    designation: string;
    isHOD?: boolean;
}

// Students Table
export const STUDENTS_TABLE: StudentRecord[] = [
    {
        id: 'std001',
        name: 'Dickson',
        email: 'dickson@university.edu',
        password: 'student123', // Demo password
        role: Role.Student,
        department: 'Computer Science',
        year: 3,
    },
    {
        id: 'std002',
        name: 'Niranjan',
        email: 'niranjan@university.edu',
        password: 'student123',
        role: Role.Student,
        department: 'Computer Science',
        year: 3,
    },
    {
        id: 'std003',
        name: 'Gokul',
        email: 'gokul@university.edu',
        password: 'student123',
        role: Role.Student,
        department: 'Computer Science',
        year: 2,
    },
    {
        id: 'std004',
        name: 'Earnest',
        email: 'earnest@university.edu',
        password: 'student123',
        role: Role.Student,
        department: 'Computer Science',
        year: 3,
    },
];

// Faculty Table
export const FACULTY_TABLE: FacultyRecord[] = [
    {
        id: 'fac001',
        name: 'Dr. Evelyn Reed',
        email: 'evelyn.reed@university.edu',
        password: 'faculty123', // Demo password
        role: Role.Faculty,
        department: 'Computer Science',
        designation: 'Professor',
        isHOD: false,
    },
    {
        id: 'fac002',
        name: 'Dr. Samuel Grant',
        email: 'samuel.grant@university.edu',
        password: 'faculty123',
        role: Role.Faculty,
        department: 'Electronics and Communication',
        designation: 'Associate Professor',
        isHOD: false,
    },
    {
        id: 'fac003',
        name: 'Dr. Maria Chen',
        email: 'maria.chen@university.edu',
        password: 'faculty123',
        role: Role.Faculty,
        department: 'Computer Science',
        designation: 'HOD & Professor',
        isHOD: true,
    },
    {
        id: 'fac004',
        name: 'Dr. Ben Carter',
        email: 'ben.carter@university.edu',
        password: 'faculty123',
        role: Role.Faculty,
        department: 'Electrical Engineering',
        designation: 'Assistant Professor',
        isHOD: false,
    },
    {
        id: 'fac005',
        name: 'Dr. Sarah Williams',
        email: 'sarah.williams@university.edu',
        password: 'faculty123',
        role: Role.Faculty,
        department: 'Computer Science',
        designation: 'Associate Professor',
        isHOD: false,
    },
    {
        id: 'fac006',
        name: 'Dr. James Anderson',
        email: 'james.anderson@university.edu',
        password: 'faculty123',
        role: Role.Faculty,
        department: 'Information Technology',
        designation: 'Professor',
        isHOD: true,
    },
];

// Database Query Functions

/**
 * Authenticate user with email and password
 */
export const authenticateUser = (email: string, password: string): StudentRecord | FacultyRecord | null => {
    // Check students
    const student = STUDENTS_TABLE.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
    if (student) return student;

    // Check faculty
    const faculty = FACULTY_TABLE.find(f => f.email.toLowerCase() === email.toLowerCase() && f.password === password);
    if (faculty) return faculty;

    return null;
};

/**
 * Get user by email
 */
export const getUserByEmail = (email: string): StudentRecord | FacultyRecord | null => {
    const student = STUDENTS_TABLE.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (student) return student;

    const faculty = FACULTY_TABLE.find(f => f.email.toLowerCase() === email.toLowerCase());
    if (faculty) return faculty;

    return null;
};

/**
 * Get all faculty members
 */
export const getAllFaculty = (): FacultyRecord[] => {
    return [...FACULTY_TABLE];
};

/**
 * Get faculty by department
 */
export const getFacultyByDepartment = (department: string): FacultyRecord[] => {
    return FACULTY_TABLE.filter(f => f.department.toLowerCase() === department.toLowerCase());
};

/**
 * Get faculty by id
 */
export const getFacultyById = (id: string): FacultyRecord | null => {
    return FACULTY_TABLE.find(f => f.id === id) || null;
};

/**
 * Get student by id
 */
export const getStudentById = (id: string): StudentRecord | null => {
    return STUDENTS_TABLE.find(s => s.id === id) || null;
};

/**
 * Check if email exists
 */
export const emailExists = (email: string): boolean => {
    return getUserByEmail(email) !== null;
};

/**
 * Get HOD of a department
 */
export const getHODByDepartment = (department: string): FacultyRecord | null => {
    return FACULTY_TABLE.find(f => f.department.toLowerCase() === department.toLowerCase() && f.isHOD === true) || null;
};
