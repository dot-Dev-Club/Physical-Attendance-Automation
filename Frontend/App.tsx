
import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import LoginPage from './components/login/LoginPage';
import StudentDashboard from './components/student/StudentDashboard';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import { Role } from './types';
import Header from './components/ui/Header';

const AppContent: React.FC = () => {
    const { user } = useAuth();

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
