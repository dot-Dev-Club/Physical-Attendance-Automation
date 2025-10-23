
import { getAllFaculty } from './data/mockDatabase';

export const PERIODS: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

// Fetch faculty from mock database
export const getMockFaculty = () => {
    return getAllFaculty().map(f => ({
        id: f.id,
        name: f.name,
        title: `${f.designation}, ${f.department}`,
    }));
};
