
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AttendanceRequest, RequestStatus } from '../types';
import { attendanceAPI } from '../services/api';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();
    const [state, setState] = useState<State>({
        requests: [],
        isLoading: false,
        error: null,
    });

    // Fetch requests from backend
    const fetchRequests = async () => {
        console.log('📡 AttendanceContext - Fetching requests...');
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        try {
            const requests = await attendanceAPI.getRequests();
            // Ensure requests is always an array
            const requestsArray = Array.isArray(requests) ? requests : [];
            console.log('✅ AttendanceContext - Fetched', requestsArray.length, 'requests');
            console.log('📊 Bulk requests:', requestsArray.filter(r => r.isBulkRequest).length);
            setState(prev => ({ ...prev, requests: requestsArray, isLoading: false }));
        } catch (error) {
            console.error('❌ AttendanceContext - Failed to fetch requests:', error);
            setState(prev => ({ 
                ...prev, 
                requests: [], // Reset to empty array on error
                isLoading: false, 
                error: error instanceof Error ? error.message : 'Failed to fetch requests'
            }));
        }
    };

    // Load requests whenever user changes (login/logout)
    useEffect(() => {
        if (user) {
            // User is logged in, fetch their requests
            fetchRequests();
        } else {
            // User logged out, clear requests
            setState({
                requests: [],
                isLoading: false,
                error: null,
            });
        }
    }, [user]);

    const addRequest = async (request: Omit<AttendanceRequest, 'id' | 'status'>) => {
        console.log('📤 AttendanceContext - Creating request:', {
            isBulk: !!(request as any).bulkStudents,
            bulkCount: (request as any).bulkStudents?.length || 0,
            date: request.date,
            periods: request.periods
        });

        try {
            // Create request payload for backend
            const payload: any = {
                date: request.date,
                periods: request.periods,
                periodFacultyMapping: request.periodFacultyMapping,
                eventCoordinator: request.eventCoordinator,
                eventCoordinatorFacultyId: request.eventCoordinatorFacultyId,
                proofFaculty: request.proofFaculty,
                purpose: request.purpose,
            };

            // Add bulk students if present
            if ((request as any).bulkStudents) {
                payload.bulkStudents = (request as any).bulkStudents;
                console.log('📋 Including bulk students:', payload.bulkStudents.length);
            }

            await attendanceAPI.createRequest(payload);
            console.log('✅ AttendanceContext - Request created successfully');
            
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('❌ AttendanceContext - Failed to create request:', error);
            throw error;
        }
    };

    const updateRequestStatus = async (id: string, status: RequestStatus, reason?: string) => {
        console.log('🔄 AttendanceContext - Updating request status:', { id, status, reason });
        try {
            await attendanceAPI.updateRequestStatus(id, status, reason);
            console.log('✅ AttendanceContext - Status updated successfully');
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('❌ AttendanceContext - Failed to update request status:', error);
            throw error;
        }
    };

    const deleteRequest = async (id: string) => {
        console.log('🗑️  AttendanceContext - Deleting request:', id);
        try {
            await attendanceAPI.deleteRequest(id);
            console.log('✅ AttendanceContext - Request deleted successfully');
            // Refresh requests list
            await fetchRequests();
        } catch (error) {
            console.error('❌ AttendanceContext - Failed to delete request:', error);
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
