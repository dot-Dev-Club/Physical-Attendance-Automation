
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AttendanceRequest, RequestStatus } from '../types';
import { attendanceAPI } from '../services/api';

interface State {
    requests: AttendanceRequest[];
    isLoading: boolean;
    error: string | null;
}

interface AttendanceContextType {
    state: State;
    fetchRequests: () => Promise<void>;
    addRequest: (request: Omit<AttendanceRequest, 'id' | 'status'>) => Promise<void>;
    updateRequestStatus: (id: string, status: RequestStatus, reason?: string) => Promise<void>;
    deleteRequest: (id: string) => Promise<void>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<State>({
        requests: [],
        isLoading: false,
        error: null,
    });

    // Fetch requests from backend
    const fetchRequests = async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const requests = await attendanceAPI.getRequests();
            setState(prev => ({ ...prev, requests, isLoading: false }));
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            setState(prev => ({ 
                ...prev, 
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch requests'
            }));
        }
    };

    // Load requests on mount if user is authenticated
    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchRequests();
        }
    }, []);

    const addRequest = async (request: Omit<AttendanceRequest, 'id' | 'status'>) => {
        try {
            // Create request payload for backend (use single day format)
            await attendanceAPI.createRequest({
                date: request.date,
                periods: request.periods,
                eventCoordinator: request.eventCoordinator,
                proofFaculty: request.proofFaculty,
                purpose: request.purpose,
            });
            
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('Failed to create request:', error);
            throw error;
        }
    };

    const updateRequestStatus = async (id: string, status: RequestStatus, reason?: string) => {
        try {
            await attendanceAPI.updateRequestStatus(id, status, reason);
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('Failed to update request status:', error);
            throw error;
        }
    };

    const deleteRequest = async (id: string) => {
        try {
            await attendanceAPI.deleteRequest(id);
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('Failed to delete request:', error);
            throw error;
        }
    };

    return (
        <AttendanceContext.Provider value={{ state, fetchRequests, addRequest, updateRequestStatus, deleteRequest }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export const useAttendance = () => {
    const context = useContext(AttendanceContext);
    if (context === undefined) {
        throw new Error('useAttendance must be used within an AttendanceProvider');
    }
    return context;
};
