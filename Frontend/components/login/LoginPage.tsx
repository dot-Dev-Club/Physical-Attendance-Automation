
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import Button from '../ui/Button';
import Card, { CardContent, CardHeader } from '../ui/Card';

const LoginPage: React.FC = () => {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome!</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Please select your role to login.</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col space-y-4">
                        <Button
                            onClick={() => login(Role.Student)}
                            variant="primary"
                            size="lg"
                            className="w-full"
                        >
                            Login as Student
                        </Button>
                        <Button
                            onClick={() => login(Role.Faculty)}
                            variant="secondary"
                            size="lg"
                            className="w-full"
                        >
                            Login as Faculty
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default LoginPage;
