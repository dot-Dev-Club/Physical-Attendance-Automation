
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { RequestStatus } from '../../types';
import AttendanceTable from '../shared/AttendanceTable';
import Button from '../ui/Button';
import NewRequestForm from './NewRequestForm';
import Modal from '../ui/Modal';
import Card, { CardContent, CardHeader } from '../ui/Card';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { state } = useAttendance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myRequests = state.requests.filter(req => req.studentId === user?.id);
    
    const stats = {
        total: myRequests.length,
        pending: myRequests.filter(r => r.status === RequestStatus.PENDING_MENTOR || r.status === RequestStatus.PENDING_HOD).length,
        approved: myRequests.filter(r => r.status === RequestStatus.APPROVED).length,
        declined: myRequests.filter(r => r.status === RequestStatus.DECLINED).length,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                            My Attendance Requests
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Submit and track your physical attendance requests
                        </p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} size="lg" className="w-full sm:w-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Request
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Total Requests
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Pending
                                </p>
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                                    {stats.pending}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Approved
                                </p>
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                                    {stats.approved}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Declined
                                </p>
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                                    {stats.declined}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Empty State or Table */}
            {myRequests.length === 0 ? (
                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-12 text-center">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No Requests Yet
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                            You haven't submitted any attendance requests. Click the "New Request" button above to submit your first attendance request.
                        </p>
                        <Button onClick={() => setIsModalOpen(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Your First Request
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <AttendanceTable requests={myRequests} title="Request History" />
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Attendance Request">
                <NewRequestForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default StudentDashboard;
