
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { PERIODS, getMockFaculty } from '../../constants';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface NewRequestFormProps {
    onClose: () => void;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { addRequest } = useAttendance();
    const facultyList = getMockFaculty();

    const [date, setDate] = useState('');
    const [periods, setPeriods] = useState<number[]>([]);
    const [eventIncharge, setEventIncharge] = useState(facultyList[0]?.id || '');
    const [purpose, setPurpose] = useState('');

    const handlePeriodChange = (period: number) => {
        setPeriods(prev => 
            prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !date || periods.length === 0 || !purpose || !eventIncharge) {
            alert('Please fill all required fields.');
            return;
        }

        const selectedFaculty = facultyList.find(f => f.id === eventIncharge);

        addRequest({
            studentId: user.id,
            studentName: user.name,
            date,
            periods: periods.sort((a,b) => a - b),
            eventCoordinator: selectedFaculty?.name || '',
            proofFaculty: selectedFaculty?.name || '',
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
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Periods *
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PERIODS.map(p => (
                            <button
                                type="button"
                                key={p}
                                onClick={() => handlePeriodChange(p)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                                    periods.includes(p)
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                }`}
                            >
                                Period {p}
                            </button>
                        ))}
                    </div>
                    {periods.length > 0 && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                            Selected: {periods.sort((a,b) => a - b).join(', ')}
                        </p>
                    )}
                </div>
                <div className="md:col-span-2">
                    <Select
                        label="Event Incharge Faculty"
                        id="event-incharge"
                        value={eventIncharge}
                        onChange={(e) => setEventIncharge(e.target.value)}
                        required
                    >
                        <option value="">Select a faculty member</option>
                        {facultyList.map(f => (
                            <option key={f.id} value={f.id}>
                                {f.name} - {f.title}
                            </option>
                        ))}
                    </Select>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                        Select the faculty member who is coordinating/supervising your event
                    </p>
                </div>
                <div className="md:col-span-2">
                     <label htmlFor="purpose" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Purpose / Event Details *
                    </label>
                    <textarea
                        id="purpose"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        placeholder="Describe the event/activity and reason for attendance request..."
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit">Submit Request</Button>
            </div>
        </form>
    );
};

export default NewRequestForm;
