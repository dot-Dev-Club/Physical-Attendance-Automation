
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import LoginPage from './components/login/LoginPage';
import StudentDashboard from './components/student/StudentDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import { Role } from './types';
import Header from './components/ui/Header';

const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <LoginPage />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {user.role === Role.Student && <StudentDashboard />}
                {user.role === Role.Faculty && <FacultyDashboard />}
            </main>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AttendanceProvider>
                <AppContent />
            </AttendanceProvider>
        </AuthProvider>
    );
};

export default App;
