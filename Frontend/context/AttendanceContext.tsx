
import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AttendanceRequest, RequestStatus } from '../types';
import { MOCK_REQUESTS } from '../constants';

type Action =
    | { type: 'ADD_REQUEST'; payload: AttendanceRequest }
    | { type: 'UPDATE_STATUS'; payload: { id: string; status: RequestStatus; reason?: string } };

interface State {
    requests: AttendanceRequest[];
}

const initialState: State = {
    requests: MOCK_REQUESTS,
};

const attendanceReducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'ADD_REQUEST':
            return {
                ...state,
                requests: [action.payload, ...state.requests],
            };
        case 'UPDATE_STATUS':
            return {
                ...state,
                requests: state.requests.map((req) =>
                    req.id === action.payload.id
                        ? { ...req, status: action.payload.status, reason: action.payload.reason || req.reason }
                        : req
                ),
            };
        default:
            return state;
    }
};

interface AttendanceContextType {
    state: State;
    addRequest: (request: Omit<AttendanceRequest, 'id' | 'status'>) => void;
    updateRequestStatus: (id: string, status: RequestStatus, reason?: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(attendanceReducer, initialState);

    const addRequest = (request: Omit<AttendanceRequest, 'id' | 'status'>) => {
        const newRequest: AttendanceRequest = {
            ...request,
            id: `req${Date.now()}`,
            status: RequestStatus.PENDING_MENTOR,
        };
        dispatch({ type: 'ADD_REQUEST', payload: newRequest });
    };

    const updateRequestStatus = (id: string, status: RequestStatus, reason?: string) => {
        dispatch({ type: 'UPDATE_STATUS', payload: { id, status, reason } });
    };

    return (
        <AttendanceContext.Provider value={{ state, addRequest, updateRequestStatus }}>
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
