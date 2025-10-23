
import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceRequest, RequestStatus } from '../../types';
import AttendanceTable from '../shared/AttendanceTable';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Input from '../ui/Input';

enum FacultyView {
    Mentor = 'Mentor View',
    HOD = 'HOD View',
}

const FacultyDashboard: React.FC = () => {
    const { state, updateRequestStatus } = useAttendance();
    const [currentView, setCurrentView] = useState<FacultyView>(FacultyView.Mentor);
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


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Faculty Dashboard</h2>
                <div className="p-1 bg-slate-200 dark:bg-slate-700 rounded-lg flex space-x-1">
                    <Button
                        onClick={() => setCurrentView(FacultyView.Mentor)}
                        variant={currentView === FacultyView.Mentor ? 'primary' : 'ghost'}
                        className="w-full sm:w-auto"
                    >
                        Mentor Queue ({mentorRequests.length})
                    </Button>
                     <Button
                        onClick={() => setCurrentView(FacultyView.HOD)}
                        variant={currentView === FacultyView.HOD ? 'primary' : 'ghost'}
                        className="w-full sm:w-auto"
                    >
                        HOD Queue ({hodRequests.length})
                    </Button>
                </div>
            </div>

            <div className={currentView === FacultyView.Mentor ? 'block' : 'hidden'}>
                <AttendanceTable
                    requests={mentorRequests}
                    title="Requests for Mentor Approval"
                    actionsComponent={renderActions}
                />
            </div>

             <div className={currentView === FacultyView.HOD ? 'block' : 'hidden'}>
                <AttendanceTable
                    requests={hodRequests}
                    title="Requests for HOD Approval"
                    actionsComponent={renderActions}
                />
            </div>
            
            <div className="pt-8">
                 <AttendanceTable requests={allRequests} title="Complete Request History" />
            </div>

            <Modal
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
