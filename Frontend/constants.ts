
import { Faculty, AttendanceRequest, RequestStatus, User, Role } from './types';

export const PERIODS: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const MOCK_FACULTY: Faculty[] = [
    { id: 'f1', name: 'Dr. Evelyn Reed', title: 'Professor, CompSci' },
    { id: 'f2', name: 'Dr. Samuel Grant', title: 'Asst. Professor, ECE' },
    { id: 'f3', name: 'Dr. Maria Chen', title: 'HOD, CompSci' },
    { id: 'f4', name: 'Dr. Ben Carter', title: 'Professor, EEE' },
];

export const MOCK_STUDENTS: User[] = [
    { id: 's1', name: 'Alice Johnson', role: Role.Student },
    { id: 's2', name: 'Bob Williams', role: Role.Student },
    { id: 's3', name: 'Charlie Brown', role: Role.Student },
];


export const MOCK_REQUESTS: AttendanceRequest[] = [
    {
        id: 'req1',
        studentId: 's1',
        studentName: 'Alice Johnson',
        date: '2024-07-28',
        periods: [3, 4],
        eventCoordinator: 'Dr. Evelyn Reed',
        proofFaculty: 'Dr. Samuel Grant',
        purpose: 'Attending workshop on AI/ML in the main auditorium.',
        status: RequestStatus.APPROVED,
    },
    {
        id: 'req2',
        studentId: 's2',
        studentName: 'Bob Williams',
        date: '2024-07-29',
        periods: [1, 2, 3, 4],
        eventCoordinator: 'Dr. Ben Carter',
        proofFaculty: 'Dr. Evelyn Reed',
        purpose: 'Organizing committee member for "Innovate 2024" tech fest.',
        status: RequestStatus.PENDING_HOD,
    },
    {
        id: 'req3',
        studentId: 's1',
        studentName: 'Alice Johnson',
        date: '2024-07-30',
        periods: [5, 6],
        eventCoordinator: 'Dr. Samuel Grant',
        proofFaculty: 'Dr. Samuel Grant',
        purpose: 'Participating in inter-college coding competition.',
        status: RequestStatus.DECLINED,
        reason: 'Event not sanctioned by the department.'
    },
    {
        id: 'req4',
        studentId: 's3',
        studentName: 'Charlie Brown',
        date: '2024-08-01',
        periods: [1, 2],
        eventCoordinator: 'Dr. Evelyn Reed',
        proofFaculty: 'Dr. Evelyn Reed',
        purpose: 'Seminar on Quantum Computing.',
        status: RequestStatus.PENDING_MENTOR,
    },
];
