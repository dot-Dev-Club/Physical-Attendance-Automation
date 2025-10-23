
export const PERIODS: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const DEPARTMENTS = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Information Technology',
] as const;

export type Department = typeof DEPARTMENTS[number];
