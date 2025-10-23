/**
 * API Service Layer
 * 
 * This file will contain all API calls to the Django backend.
 * Currently contains placeholder functions that will be implemented
 * once the backend API is ready.
 * 
 * TODO: 
 * - Add Axios or fetch configuration
 * - Implement authentication endpoints
 * - Implement attendance request CRUD operations
 * - Add error handling and interceptors
 * - Add request/response typing
 */

import { User, Role, AttendanceRequest, RequestStatus } from '../types';

// TODO: Replace with actual backend URL from environment variables
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Authentication API
 */
export const authAPI = {
    /**
     * Login user
     * @param credentials - User login credentials
     * @returns User data and authentication token
     */
    login: async (credentials: { email: string; password: string }): Promise<{ user: User; token: string }> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Get current user profile
     */
    getCurrentUser: async (): Promise<User> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (): Promise<{ token: string }> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },
};

/**
 * Attendance Request API
 */
export const attendanceAPI = {
    /**
     * Get all attendance requests (with optional filters)
     */
    getRequests: async (filters?: {
        studentId?: string;
        status?: RequestStatus;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AttendanceRequest[]> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Get a single attendance request by ID
     */
    getRequestById: async (id: string): Promise<AttendanceRequest> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Create new attendance request
     */
    createRequest: async (request: Omit<AttendanceRequest, 'id' | 'status'>): Promise<AttendanceRequest> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Update attendance request status (approve/decline)
     */
    updateRequestStatus: async (
        id: string,
        status: RequestStatus,
        reason?: string
    ): Promise<AttendanceRequest> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Delete attendance request
     */
    deleteRequest: async (id: string): Promise<void> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Upload proof document for attendance request
     */
    uploadProof: async (requestId: string, file: File): Promise<{ url: string }> => {
        // TODO: Implement actual API call with multipart/form-data
        throw new Error('API not implemented yet. Backend integration pending.');
    },
};

/**
 * Faculty API
 */
export const facultyAPI = {
    /**
     * Get all faculty members
     */
    getAllFaculty: async (): Promise<Array<{ id: string; name: string; title: string }>> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },

    /**
     * Get faculty by department
     */
    getFacultyByDepartment: async (department: string): Promise<Array<{ id: string; name: string; title: string }>> => {
        // TODO: Implement actual API call
        throw new Error('API not implemented yet. Backend integration pending.');
    },
};

/**
 * API Error Handler
 * 
 * TODO: Implement comprehensive error handling
 */
export class APIError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public errorCode?: string
    ) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * API Interceptor Configuration
 * 
 * TODO: Add request/response interceptors for:
 * - Adding authentication headers
 * - Handling token refresh
 * - Global error handling
 * - Request/response logging
 */
