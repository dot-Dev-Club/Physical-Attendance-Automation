
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-slate-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"></path>
                        </svg>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Physical Attendance System</h1>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-4">
                             <span className="text-sm font-medium">
                                Welcome, <span className="font-bold">{user.name}</span> ({user.role})
                            </span>
                            <Button onClick={logout} variant="secondary" size="sm">Logout</Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
