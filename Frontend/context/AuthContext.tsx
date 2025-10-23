
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User, Role } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: Role) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from backend on mount
    useEffect(() => {
        const initAuth = async () => {
            const token = sessionStorage.getItem('token');
            if (token) {
                try {
                    const currentUser = await authAPI.getCurrentUser();
                    setUser({
                        id: currentUser.id,
                        name: currentUser.name,
                        role: currentUser.role as Role,
                        isHOD: currentUser.isHOD || false,
                    });
                } catch (error) {
                    console.error('Failed to load user:', error);
                    sessionStorage.clear();
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string, role: Role): Promise<boolean> => {
        try {
            const response = await authAPI.login({ email, password, role });
            
            // Tokens are already stored by api.ts
            // Just set user from response
            const loggedInUser: User = {
                id: response.user.id,
                name: response.user.name,
                role: response.user.role as Role,
                isHOD: response.user.isHOD || false,
            };
            
            setUser(loggedInUser);
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            sessionStorage.clear();
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
