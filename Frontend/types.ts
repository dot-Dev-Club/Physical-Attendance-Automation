
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

export interface BulkStudent {
    registerNumber: string;
    name: string;
}

export interface AttendanceRequest {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail?: string;
    date: string;
    periods: number[];
    periodFacultyMapping?: Record<string, string>; // period number -> faculty ID
    eventCoordinator: string;
    eventCoordinatorFacultyId?: string; // ID of faculty who is event coordinator
    eventCoordinatorFacultyName?: string;
    proofFaculty: string;
    purpose: string;
    status: RequestStatus;
    reason?: string;
    isBulkRequest?: boolean; // NEW: Flag for bulk requests
    bulkStudents?: BulkStudent[]; // NEW: Array of students for bulk requests
    createdBy?: string; // NEW: ID of user who created the request
    createdByName?: string; // NEW: Name of user who created
    createdAt?: string;
    updatedAt?: string;
}

export interface Faculty {
    id: string;
    name: string;
    title: string;
    department?: string;
    email?: string;
}
