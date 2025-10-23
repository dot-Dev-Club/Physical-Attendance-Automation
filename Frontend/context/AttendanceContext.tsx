
import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { AttendanceRequest, RequestStatus } from '../types';

type Action =
    | { type: 'ADD_REQUEST'; payload: AttendanceRequest }
    | { type: 'UPDATE_STATUS'; payload: { id: string; status: RequestStatus; reason?: string } }
    | { type: 'LOAD_FROM_SESSION'; payload: AttendanceRequest[] };

interface State {
    requests: AttendanceRequest[];
}

// Load data from sessionStorage (temporary cache - cleared on browser close)
const loadFromSession = (): AttendanceRequest[] => {
    try {
        const stored = sessionStorage.getItem('attendance_requests');
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load from sessionStorage:', error);
        return [];
    }
};

// Save data to sessionStorage
const saveToSession = (requests: AttendanceRequest[]) => {
    try {
        sessionStorage.setItem('attendance_requests', JSON.stringify(requests));
    } catch (error) {
        console.error('Failed to save to sessionStorage:', error);
    }
};

const initialState: State = {
    requests: [], // Start with empty - will load from session in provider
};

const attendanceReducer = (state: State, action: Action): State => {
    let newState: State;
    
    switch (action.type) {
        case 'LOAD_FROM_SESSION':
            return {
                ...state,
                requests: action.payload,
            };
        case 'ADD_REQUEST':
            newState = {
                ...state,
                requests: [action.payload, ...state.requests],
            };
            saveToSession(newState.requests);
            return newState;
        case 'UPDATE_STATUS':
            newState = {
                ...state,
                requests: state.requests.map((req) =>
                    req.id === action.payload.id
                        ? { ...req, status: action.payload.status, reason: action.payload.reason || req.reason }
                        : req
                ),
            };
            saveToSession(newState.requests);
            return newState;
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

    // Load data from sessionStorage on mount
    useEffect(() => {
        const sessionData = loadFromSession();
        dispatch({ type: 'LOAD_FROM_SESSION', payload: sessionData });
    }, []);

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
