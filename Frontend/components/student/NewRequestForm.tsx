
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

interface DayPeriods {
    date: string;
    periods: number[];
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { addRequest } = useAttendance();
    const facultyList = getMockFaculty();

    const [isMultipleDays, setIsMultipleDays] = useState(false);
    
    // Single day mode
    const [singleDate, setSingleDate] = useState('');
    const [singlePeriods, setSinglePeriods] = useState<number[]>([]);
    
    // Multiple days mode
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [dayPeriods, setDayPeriods] = useState<DayPeriods[]>([]);
    
    // Common fields
    const [eventIncharge, setEventIncharge] = useState(facultyList[0]?.id || '');
    const [purpose, setPurpose] = useState('');

    // Generate dates between fromDate and toDate
    const generateDateRange = (from: string, to: string): string[] => {
        const dates: string[] = [];
        const start = new Date(from);
        const end = new Date(to);
        
        while (start <= end) {
            dates.push(start.toISOString().split('T')[0]);
            start.setDate(start.getDate() + 1);
        }
        return dates;
    };

    // Initialize day periods when dates change
    const handleDateRangeChange = (from: string, to: string) => {
        if (from && to && from <= to) {
            const dates = generateDateRange(from, to);
            const newDayPeriods: DayPeriods[] = dates.map(date => ({
                date,
                periods: dayPeriods.find(dp => dp.date === date)?.periods || []
            }));
            setDayPeriods(newDayPeriods);
        } else {
            setDayPeriods([]);
        }
    };

    const handleFromDateChange = (date: string) => {
        setFromDate(date);
        if (date && toDate) {
            handleDateRangeChange(date, toDate);
        }
    };

    const handleToDateChange = (date: string) => {
        setToDate(date);
        if (fromDate && date) {
            handleDateRangeChange(fromDate, date);
        }
    };

    const handleSinglePeriodChange = (period: number) => {
        setSinglePeriods(prev => 
            prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
        );
    };

    const handleMultipleDayPeriodChange = (date: string, period: number) => {
        setDayPeriods(prev => prev.map(dp => {
            if (dp.date === date) {
                return {
                    ...dp,
                    periods: dp.periods.includes(period) 
                        ? dp.periods.filter(p => p !== period) 
                        : [...dp.periods, period]
                };
            }
            return dp;
        }));
    };

    const formatDateDisplay = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !purpose || !eventIncharge) {
            alert('Please fill all required fields.');
            return;
        }

        const selectedFaculty = facultyList.find(f => f.id === eventIncharge);

        if (isMultipleDays) {
            // Validate multiple days
            if (dayPeriods.length === 0 || dayPeriods.some(dp => dp.periods.length === 0)) {
                alert('Please select at least one period for each day.');
                return;
            }

            // Create separate request for each day
            dayPeriods.forEach(dp => {
                addRequest({
                    studentId: user.id,
                    studentName: user.name,
                    date: dp.date,
                    periods: dp.periods.sort((a, b) => a - b),
                    eventCoordinator: selectedFaculty?.name || '',
                    proofFaculty: selectedFaculty?.name || '',
                    purpose,
                });
            });
        } else {
            // Single day validation
            if (!singleDate || singlePeriods.length === 0) {
                alert('Please select date and at least one period.');
                return;
            }

            addRequest({
                studentId: user.id,
                studentName: user.name,
                date: singleDate,
                periods: singlePeriods.sort((a, b) => a - b),
                eventCoordinator: selectedFaculty?.name || '',
                proofFaculty: selectedFaculty?.name || '',
                purpose,
            });
        }
        
        onClose();
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Toggle between single/multiple days */}
                <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => setIsMultipleDays(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            !isMultipleDays
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        Single Day
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsMultipleDays(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            isMultipleDays
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        Multiple Days
                    </button>
                </div>

                {!isMultipleDays ? (
                    // Single Day Mode
                    <>
                        <Input
                            label="Date"
                            id="date"
                            type="date"
                            value={singleDate}
                            onChange={(e) => setSingleDate(e.target.value)}
                            required
                        />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Periods *
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {PERIODS.map(p => (
                                    <button
                                        type="button"
                                        key={p}
                                        onClick={() => handleSinglePeriodChange(p)}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                                            singlePeriods.includes(p)
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600'
                                        }`}
                                    >
                                        Period {p}
                                    </button>
                                ))}
                            </div>
                            {singlePeriods.length > 0 && (
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                    Selected: {singlePeriods.sort((a, b) => a - b).join(', ')}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    // Multiple Days Mode
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="From Date"
                                id="from-date"
                                type="date"
                                value={fromDate}
                                onChange={(e) => handleFromDateChange(e.target.value)}
                                required
                            />
                            <Input
                                label="To Date"
                                id="to-date"
                                type="date"
                                value={toDate}
                                onChange={(e) => handleToDateChange(e.target.value)}
                                min={fromDate}
                                required
                            />
                        </div>

                        {dayPeriods.length > 0 && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select Periods for Each Day *
                                </label>
                                <div className="max-h-64 overflow-y-auto space-y-3 pr-2 border border-slate-200 dark:border-slate-600 rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
                                    {dayPeriods.map((dp, idx) => (
                                        <div 
                                            key={dp.date} 
                                            className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800"
                                        >
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                                                {formatDateDisplay(dp.date)}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {PERIODS.map(p => (
                                                    <button
                                                        type="button"
                                                        key={`${dp.date}-${p}`}
                                                        onClick={() => handleMultipleDayPeriodChange(dp.date, p)}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-all ${
                                                            dp.periods.includes(p)
                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600'
                                                        }`}
                                                    >
                                                        P{p}
                                                    </button>
                                                ))}
                                            </div>
                                            {dp.periods.length > 0 && (
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                                    Selected: {dp.periods.sort((a, b) => a - b).join(', ')}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div>
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

                <div>
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
