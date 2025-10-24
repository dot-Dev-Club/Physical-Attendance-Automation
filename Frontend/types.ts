
export enum Role {
    Student = 'Student',
    Faculty = 'Faculty',
}

export interface User {
    id: string;
    name: string;
    role: Role;
    isHOD?: boolean; // Only applicable for Faculty role
}

export enum RequestStatus {
    PENDING_MENTOR = 'PENDING_MENTOR',
    PENDING_HOD = 'PENDING_HOD',
    APPROVED = 'APPROVED',
    DECLINED = 'DECLINED',
}

export interface AttendanceRequest {
    id: string;
    studentId: string;
    studentName: string;
    date: string;
    periods: number[];
    eventCoordinator: string;
    proofFaculty: string;
    purpose: string;
    status: RequestStatus;
    reason?: string;
}

export interface Faculty {
    id: string;
    name: string;
    title: string;
}
