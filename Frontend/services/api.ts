/**
 * API Service Layer
 * 
 * This file contains all API calls to the Django backend.
 * Connected to Django backend running at http://localhost:8000/api
 */
//Just for Checking delete it after
import { User, Role, AttendanceRequest, RequestStatus } from '../types';

// API Base URL - Update this for production
const API_BASE_URL = 'https://attendance-api.atom.org.in/api';

// Helper function to get auth token from sessionStorage
const getAuthToken = (): string | null => {
    return sessionStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

/**
 * Authentication API
 */
export const authAPI = {
    /**
     * Login user
     * @param credentials - User login credentials
     * @returns User data and authentication token
     */
    login: async (credentials: { email: string; password: string; role: Role }): Promise<{ user: User; token: string; refreshToken: string }> => {
        const response = await fetch(`${API_BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new APIError(
                error.error?.message || 'Login failed',
                response.status,
                error.error?.code
            );
        }

        const data = await response.json();
        
        // Store tokens in sessionStorage
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('refreshToken', data.refreshToken);
        
        return data;
    },

    /**
     * Logout user
     */
    logout: async (): Promise<void> => {
        try {
            const refreshToken = sessionStorage.getItem('refreshToken');
            await fetch(`${API_BASE_URL}/auth/logout/`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ refreshToken }),
            });
        } finally {
            // Clear tokens regardless of API response
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refreshToken');
        }
    },

    /**
     * Get current user profile
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await fetch(`${API_BASE_URL}/auth/me/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch user profile', response.status);
        }

        return await response.json();
    },

    /**
     * Refresh authentication token
     */
    refreshToken: async (): Promise<{ token: string }> => {
        const refreshToken = sessionStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new APIError('No refresh token available', 401);
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            throw new APIError('Failed to refresh token', response.status);
        }

        const data = await response.json();
        sessionStorage.setItem('token', data.token);
        
        return data;
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
        history?: boolean;
    }): Promise<AttendanceRequest[]> => {
        const params = new URLSearchParams();
        if (filters?.studentId) params.append('studentId', filters.studentId);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
        if (filters?.dateTo) params.append('dateTo', filters.dateTo);
        if (filters?.history) params.append('history', 'true');

        const url = `${API_BASE_URL}/attendance/requests/${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch requests', response.status);
        }

        const data = await response.json();
        // Backend returns paginated response with {count, results}
        return data.results || data;
    },

    /**
     * Get a single attendance request by ID
     */
    getRequestById: async (id: string): Promise<AttendanceRequest> => {
        const response = await fetch(`${API_BASE_URL}/attendance/requests/${id}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch request', response.status);
        }

        return await response.json();
    },

    /**
     * Create new attendance request (single or bulk)
     */
    createRequest: async (
        request: {
            date?: string;
            periods?: number[];
            periodFacultyMapping?: Record<string, string>;
            eventCoordinator?: string;
            eventCoordinatorFacultyId?: string;
            proofFaculty?: string;
            purpose?: string;
            bulkStudents?: Array<{ registerNumber: string; name: string }>; // For bulk requests
            requests?: Array<{
                date: string;
                periods: number[];
                periodFacultyMapping?: Record<string, string>;
                eventCoordinator: string;
                eventCoordinatorFacultyId?: string;
                proofFaculty: string;
                purpose: string;
            }>;
        }
    ): Promise<AttendanceRequest | AttendanceRequest[]> => {
        console.log('📡 API - Creating attendance request:', {
            isBulk: !!request.bulkStudents,
            bulkCount: request.bulkStudents?.length || 0,
            date: request.date,
            periods: request.periods
        });

        const response = await fetch(`${API_BASE_URL}/attendance/requests/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ API - Request creation failed:', error);
            throw new APIError(
                error.error?.message || 'Failed to create request',
                response.status,
                error.error?.code
            );
        }

        const result = await response.json();
        console.log('✅ API - Request created successfully:', result);
        return result;
    },

    /**
     * Update attendance request status (approve/decline)
     */
    updateRequestStatus: async (
        id: string,
        status: RequestStatus,
        reason?: string
    ): Promise<AttendanceRequest> => {
        const response = await fetch(`${API_BASE_URL}/attendance/requests/${id}/status/`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, reason }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new APIError(
                error.error?.message || 'Failed to update request status',
                response.status,
                error.error?.code
            );
        }

        return await response.json();
    },

    /**
     * Delete attendance request
     */
    deleteRequest: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/attendance/requests/${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new APIError(
                error.error?.message || 'Failed to delete request',
                response.status,
                error.error?.code
            );
        }
    },

    /**
     * Upload proof document for attendance request
     */
    uploadProof: async (requestId: string, file: File): Promise<{ proofUrl: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/attendance/requests/${requestId}/proof/`, {
            method: 'POST',
            headers: {
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: formData,
        });

        if (!response.ok) {
            throw new APIError('Failed to upload proof', response.status);
        }

        return await response.json();
    },

    /**
     * Get attendance statistics
     */
    getStatistics: async (): Promise<{
        total: number;
        pending?: number;
        pendingMentor?: number;
        pendingHOD?: number;
        approved: number;
        declined: number;
    }> => {
        const response = await fetch(`${API_BASE_URL}/attendance/statistics/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch statistics', response.status);
        }

        return await response.json();
    },
};

/**
 * Faculty API
 */
export const facultyAPI = {
    /**
     * Get all faculty members
     */
    getAllFaculty: async (): Promise<Array<{ id: string; name: string; title: string; department: string; email: string; isHOD: boolean }>> => {
        const response = await fetch(`${API_BASE_URL}/faculty/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch faculty', response.status);
        }

        const data = await response.json();
        // Backend returns paginated response with {count, results}
        return data.results || data;
    },

    /**
     * Get faculty by department
     */
    getFacultyByDepartment: async (department: string): Promise<Array<{ id: string; name: string; title: string; department: string; email: string; isHOD: boolean }>> => {
        const response = await fetch(`${API_BASE_URL}/faculty/by-department/${encodeURIComponent(department)}/`, {
            method: 'GET',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new APIError('Failed to fetch faculty by department', response.status);
        }

        const data = await response.json();
        // Backend returns paginated response with {count, results}
        return data.results || data;
    },
};

/**
 * API Error Handler
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
