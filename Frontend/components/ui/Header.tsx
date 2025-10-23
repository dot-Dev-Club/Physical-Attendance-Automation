
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Header: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-slate-900 dark:text-white leading-tight">
                                Attendance Management System
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">University Academic Portal</p>
                        </div>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-6">
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {user.name}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                    {user.isHOD ? 'HOD' : user.role}
                                </span>
                            </div>
                            <Button onClick={logout} variant="secondary" size="sm">
                                <span className="hidden sm:inline">Sign Out</span>
                                <span className="sm:hidden">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
