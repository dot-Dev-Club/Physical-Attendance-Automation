
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import AttendanceTable from '../shared/AttendanceTable';
import Button from '../ui/Button';
import NewRequestForm from './NewRequestForm';
import Modal from '../ui/Modal';

const StudentDashboard: React.FC = () => {
    const { user } = useAuth();
    const { state } = useAttendance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const myRequests = state.requests.filter(req => req.studentId === user?.id);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance Requests</h2>
                <Button onClick={() => setIsModalOpen(true)}>Apply for Attendance</Button>
            </div>

            <AttendanceTable requests={myRequests} title="Request History" />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Physical Attendance Request">
                <NewRequestForm onClose={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default StudentDashboard;
