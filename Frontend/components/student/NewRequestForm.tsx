
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { PERIODS, MOCK_FACULTY } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card, { CardContent, CardFooter, CardHeader } from '../ui/Card';

interface NewRequestFormProps {
    onClose: () => void;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { addRequest } = useAttendance();

    const [date, setDate] = useState('');
    const [periods, setPeriods] = useState<number[]>([]);
    const [eventCoordinator, setEventCoordinator] = useState(MOCK_FACULTY[0].name);
    const [proofFaculty, setProofFaculty] = useState(MOCK_FACULTY[0].name);
    const [purpose, setPurpose] = useState('');

    const handlePeriodChange = (period: number) => {
        setPeriods(prev => 
            prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || periods.length === 0 || !purpose) {
            alert('Please fill all required fields.');
            return;
        }

        addRequest({
            studentId: user.id,
            studentName: user.name,
            date,
            periods: periods.sort((a,b) => a - b),
            eventCoordinator,
            proofFaculty,
            purpose,
        });
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Date"
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Number of Periods
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-3 py-1.5 text-sm rounded-full border ${periods.includes(p) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                            >
                                Period {p}
                            </button>
                        ))}
                    </div>
                </div>
                <Select
                    label="Event Coordinator"
                    id="event-coordinator"
                    value={eventCoordinator}
                    onChange={(e) => setEventCoordinator(e.target.value)}
                    required
                >
                    {MOCK_FACULTY.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </Select>
                <Select
                    label="Faculty to Send Proof"
                    id="proof-faculty"
                    value={proofFaculty}
                    onChange={(e) => setProofFaculty(e.target.value)}
                    required
                >
                    {MOCK_FACULTY.map(f => <option key={f.id} value={f.name}>{f.name}</option>)}
                </Select>
                <div className="md:col-span-2">
                     <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Purpose
                    </label>
                    <textarea
                        id="purpose"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
            </div>
        </form>
    );
};

export default NewRequestForm;
