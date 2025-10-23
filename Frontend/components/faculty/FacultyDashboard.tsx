
import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { useAuth } from '../../context/AuthContext';
import { AttendanceRequest, RequestStatus } from '../../types';
import AttendanceTable from '../shared/AttendanceTable';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Card, { CardContent } from '../ui/Card';

const FacultyDashboard: React.FC = () => {
    const { user } = useAuth();
    const { state, updateRequestStatus } = useAttendance();
    const isHOD = user?.isHOD || false;
    
    const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);
    const [declineReason, setDeclineReason] = useState('');


    const handleDeclineClick = (request: AttendanceRequest) => {
        setSelectedRequest(request);
        setIsDeclineModalOpen(true);
    };

    const handleConfirmDecline = () => {
        if (selectedRequest) {
            updateRequestStatus(selectedRequest.id, RequestStatus.DECLINED, declineReason);
        }
        setIsDeclineModalOpen(false);
        setSelectedRequest(null);
        setDeclineReason('');
    };

    const handleApproveClick = (id: string, currentStatus: RequestStatus) => {
        const nextStatus = currentStatus === RequestStatus.PENDING_MENTOR ? RequestStatus.PENDING_HOD : RequestStatus.APPROVED;
        updateRequestStatus(id, nextStatus);
    };

    const renderActions = (request: AttendanceRequest) => (
        <div className="flex space-x-2">
            <Button
                variant="success"
                size="sm"
                onClick={() => handleApproveClick(request.id, request.status)}
            >
                Approve
            </Button>
            <Button
                variant="danger"
                size="sm"
                onClick={() => handleDeclineClick(request)}
            >
                Decline
            </Button>
        </div>
    );

    const mentorRequests = state.requests.filter(req => req.status === RequestStatus.PENDING_MENTOR);
    const hodRequests = state.requests.filter(req => req.status === RequestStatus.PENDING_HOD);
    const allRequests = state.requests;

    const stats = {
        total: allRequests.length,
        mentorPending: mentorRequests.length,
        hodPending: hodRequests.length,
        approved: allRequests.filter(r => r.status === RequestStatus.APPROVED).length,
        declined: allRequests.filter(r => r.status === RequestStatus.DECLINED).length,
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-1">
                            {isHOD ? 'HOD Dashboard' : 'Faculty Dashboard'}
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {isHOD 
                                ? 'Review and approve attendance requests as Head of Department' 
                                : 'Review and approve student attendance requests'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card className="border border-slate-200 dark:border-slate-700">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                                    Total
                                </p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                                    {stats.total}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                                    Mentor Queue
                                </p>
                                <p className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">
                                    {stats.mentorPending}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-amber-200 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                                    HOD Queue
                                </p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300 mt-1">
                                    {stats.hodPending}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-200 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Requests Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-6">
                    {isHOD ? (
                        // HOD View - Show HOD pending requests
                        hodRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No pending HOD approvals
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Requests approved by mentors will appear here for your review.
                                </p>
                            </div>
                        ) : (
                            <AttendanceTable
                                requests={hodRequests}
                                title=""
                                actionsComponent={renderActions}
                            />
                        )
                    ) : (
                        // Faculty View - Show Mentor pending requests
                        mentorRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    No Requests Available
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Student requests will appear here for review and approval.
                                </p>
                            </div>
                        ) : (
                            <AttendanceTable
                                requests={mentorRequests}
                                title=""
                                actionsComponent={renderActions}
                            />
                        )
                    )}
                </div>
            </div>            <Modal
                isOpen={isDeclineModalOpen}
                onClose={() => setIsDeclineModalOpen(false)}
                title="Decline Request"
            >
                <div>
                    <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                        Please provide a reason for declining this request (optional).
                    </p>
                    <Input
                        label="Reason for Decline"
                        id="decline-reason"
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                    />
                    <div className="flex justify-end space-x-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsDeclineModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleConfirmDecline}>Confirm Decline</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FacultyDashboard;
