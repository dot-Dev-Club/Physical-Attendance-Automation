
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { authenticateUser, StudentRecord, FacultyRecord } from '../data/mockDatabase';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Load user from sessionStorage (temporary cache - cleared on browser close)
const loadUserFromSession = (): User | null => {
    try {
        const stored = sessionStorage.getItem('auth_user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to load user from sessionStorage:', error);
        return null;
    }
};

// Save user to sessionStorage
const saveUserToSession = (user: User | null) => {
    try {
        if (user) {
            sessionStorage.setItem('auth_user', JSON.stringify(user));
        } else {
            sessionStorage.removeItem('auth_user');
        }
    } catch (error) {
        console.error('Failed to save user to sessionStorage:', error);
    }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    // Load user from sessionStorage on mount
    useEffect(() => {
        const sessionUser = loadUserFromSession();
        if (sessionUser) {
            setUser(sessionUser);
        }
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // Authenticate against mock database
        const authenticatedUser = authenticateUser(email, password);
        
        if (!authenticatedUser) {
            return false;
        }

        // Convert database record to User type
        const loggedInUser: User = {
            id: authenticatedUser.id,
            name: authenticatedUser.name,
            role: authenticatedUser.role,
            isHOD: 'isHOD' in authenticatedUser ? authenticatedUser.isHOD : false,
        };
        
        setUser(loggedInUser);
        saveUserToSession(loggedInUser);
        return true;
    };

    const logout = () => {
        setUser(null);
        saveUserToSession(null);
        // Clear all session data on logout
        sessionStorage.clear();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
