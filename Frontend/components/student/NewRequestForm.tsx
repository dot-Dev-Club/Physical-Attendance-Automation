
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAttendance } from '../../context/AttendanceContext';
import { PERIODS } from '../../constants';
import { facultyAPI } from '../../services/api';
import { BulkStudent } from '../../types';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface NewRequestFormProps {
    onClose: () => void;
}

interface FacultyMember {
    id: string;
    name: string;
    title: string;
    department: string;
}

const NewRequestForm: React.FC<NewRequestFormProps> = ({ onClose }) => {
    const { user } = useAuth();
    const { addRequest } = useAttendance();

    const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
    const [isLoadingFaculty, setIsLoadingFaculty] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isBulkRequest, setIsBulkRequest] = useState(false);
    
    // Common fields for both single and bulk
    const [date, setDate] = useState('');
    const [periods, setPeriods] = useState<number[]>([]);
    const [periodFacultyMapping, setPeriodFacultyMapping] = useState<Record<string, string>>({});
    
    // Bulk student fields
    const [bulkStudents, setBulkStudents] = useState<BulkStudent[]>([]);
    const [registerNumber, setRegisterNumber] = useState('');
    const [studentName, setStudentName] = useState('');
    const [bulkTextInput, setBulkTextInput] = useState('');
    
    // Common fields
    const [eventIncharge, setEventIncharge] = useState('');
    const [eventInchargeFacultyId, setEventInchargeFacultyId] = useState('');
    const [purpose, setPurpose] = useState('');

    console.log('🔧 NewRequestForm - Component State:', {
        isBulkRequest,
        bulkStudentsCount: bulkStudents.length,
        date,
        periodsCount: periods.length,
        purpose: purpose.substring(0, 30) + '...'
    });

    // Fetch faculty list on mount
    useEffect(() => {
        const loadFaculty = async () => {
            try {
                console.log('📡 Fetching faculty list...');
                const faculty = await facultyAPI.getAllFaculty();
                console.log('✅ Faculty loaded:', faculty.length, 'members'); 
                
                // Ensure faculty is an array
                if (Array.isArray(faculty)) {
                    setFacultyList(faculty);
                    if (faculty.length > 0) {
                        setEventIncharge(faculty[0].name);
                        setEventInchargeFacultyId(faculty[0].id);
                        console.log('🎯 Default faculty selected:', faculty[0].name);
                    }
                } else {
                    console.error('❌ Faculty response is not an array:', faculty);
                    setFacultyList([]);
                    alert('Failed to load faculty list. Please refresh the page.');
                }
            } catch (error) {
                console.error('❌ Failed to load faculty:', error);
                setFacultyList([]);
                alert('Failed to load faculty list. Please try again.');
            } finally {
                setIsLoadingFaculty(false);
            }
        };
        loadFaculty();
    }, []);

    // Handle period selection
    const handlePeriodChange = (period: number) => {
        console.log('🔄 Period selection toggled:', period);
        setPeriods(prev => {
            const newPeriods = prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period];
            console.log('📋 Updated periods:', newPeriods);
            
            // If period is removed, also remove from faculty mapping
            if (!newPeriods.includes(period)) {
                setPeriodFacultyMapping(prevMapping => {
                    const newMapping = { ...prevMapping };
                    delete newMapping[period.toString()];
                    console.log('🗑️  Removed period', period, 'from faculty mapping');
                    return newMapping;
                });
            } else if (!periodFacultyMapping[period.toString()] && facultyList.length > 0) {
                // Auto-select first faculty for new period
                setPeriodFacultyMapping(prevMapping => {
                    const newMapping = {
                        ...prevMapping,
                        [period.toString()]: facultyList[0].id
                    };
                    console.log('✅ Auto-assigned faculty for period', period);
                    return newMapping;
                });
            }
            
            return newPeriods;
        });
    };
    
    const handlePeriodFacultyChange = (period: number, facultyId: string) => {
        console.log('👨‍🏫 Faculty assigned to period', period, ':', facultyId);
        setPeriodFacultyMapping(prev => ({
            ...prev,
            [period.toString()]: facultyId
        }));
    };

    // Bulk student handlers
    const handleAddStudent = () => {
        if (registerNumber.trim() && studentName.trim()) {
            const newStudent = {
                registerNumber: registerNumber.trim().toUpperCase(),
                name: studentName.trim()
            };
            console.log('➕ Adding student to bulk list:', newStudent);
            setBulkStudents([...bulkStudents, newStudent]);
            setRegisterNumber('');
            setStudentName('');
        } else {
            console.warn('⚠️  Cannot add student - missing register number or name');
        }
    };

    const handleRemoveStudent = (index: number) => {
        console.log('➖ Removing student at index:', index);
        setBulkStudents(bulkStudents.filter((_, i) => i !== index));
    };

    const handleBulkPaste = () => {
        if (!bulkTextInput.trim()) {
            console.warn('⚠️  No bulk text to parse');
            return;
        }

        console.log('📋 Parsing bulk student input...');
        const lines = bulkTextInput.split('\n').filter(line => line.trim());
        const newStudents: BulkStudent[] = [];
        
        lines.forEach((line, idx) => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                const [regNo, ...nameParts] = parts;
                if (regNo && nameParts.join(' ')) {
                    newStudents.push({
                        registerNumber: regNo.toUpperCase(),
                        name: nameParts.join(' ')
                    });
                }
            } else {
                console.warn(`⚠️  Line ${idx + 1} skipped - invalid format:`, line);
            }
        });
        
        console.log('✅ Parsed', newStudents.length, 'students from bulk input');
        setBulkStudents([...bulkStudents, ...newStudents]);
        setBulkTextInput('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('📤 Form submission started');
        
        if (!user || !purpose || !eventIncharge) {
            console.error('❌ Validation failed - missing required fields');
            alert('Please fill all required fields.');
            return;
        }

        // Validate purpose length (minimum 10 characters)
        if (purpose.trim().length < 10) {
            console.error('❌ Purpose too short:', purpose.length, 'characters');
            alert('Purpose must be at least 10 characters long. Please provide more details about the event.');
            return;
        }

        // Validate date and periods
        if (!date || periods.length === 0) {
            console.error('❌ Missing date or periods');
            alert('Please select date and at least one period.');
            return;
        }
        
        // Validate all periods have faculty assigned
        for (const period of periods) {
            if (!periodFacultyMapping[period.toString()]) {
                console.error('❌ Period', period, 'missing faculty assignment');
                alert(`Please select a faculty for Period ${period}.`);
                return;
            }
        }

        // Validate bulk students if bulk request
        if (isBulkRequest && bulkStudents.length === 0) {
            console.error('❌ Bulk request but no students added');
            alert('Please add at least one student for bulk request.');
            return;
        }

        setIsSubmitting(true);
        console.log('🚀 Submitting request:', {
            isBulkRequest,
            studentsCount: isBulkRequest ? bulkStudents.length : 1,
            date,
            periods,
            eventCoordinator: eventIncharge
        });

        try {
            const requestData: any = {
                studentId: user.id,
                studentName: user.name,
                date,
                periods: periods.sort((a, b) => a - b),
                periodFacultyMapping,
                eventCoordinator: eventIncharge,
                eventCoordinatorFacultyId: eventInchargeFacultyId,
                proofFaculty: eventIncharge,
                purpose,
            };

            // Add bulk students if this is a bulk request
            if (isBulkRequest) {
                requestData.bulkStudents = bulkStudents;
                console.log('📋 Including', bulkStudents.length, 'students in bulk request');
            }

            console.log('📡 Sending request to API...');
            await addRequest(requestData);
            console.log('✅ Request submitted successfully');
            
            onClose();
        } catch (error) {
            console.error('❌ Failed to submit request:', error);
            alert('Failed to submit request. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-6">
                {/* Toggle between single/bulk request */}
                <div className="flex items-center space-x-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={() => {
                            console.log('🔄 Switching to Single Request mode');
                            setIsBulkRequest(false);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            !isBulkRequest
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        👤 Single Student
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            console.log('🔄 Switching to Bulk Request mode');
                            setIsBulkRequest(true);
                        }}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                            isBulkRequest
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                    >
                        👥 Bulk (Team/Group)
                    </button>
                </div>

                {/* Bulk Students Section */}
                {isBulkRequest && (
                    <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                                👥 Team Members ({bulkStudents.length} students)
                            </h3>
                            {bulkStudents.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log('🗑️  Clearing all bulk students');
                                        setBulkStudents([]);
                                    }}
                                    className="text-xs text-red-600 dark:text-red-400 hover:underline"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>

                        {/* Option 1: Add one by one */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Add Students One by One:
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Register Number (e.g., URK23AI1090)"
                                    value={registerNumber}
                                    onChange={(e) => setRegisterNumber(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStudent())}
                                />
                                <input
                                    type="text"
                                    placeholder="Student Name"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStudent())}
                                />
                                <button
                                    type="button"
                                    onClick={handleAddStudent}
                                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Add
                                </button>
                            </div>
                        </div>

                        {/* Option 2: Bulk paste */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Or Paste Multiple (one per line: "RegNo, Name"):
                            </label>
                            <textarea
                                placeholder="URK23AI1090, Gokul P&#10;URK23AI1091, Niranjan T&#10;URK23AI1092, Dickson E"
                                rows={3}
                                value={bulkTextInput}
                                onChange={(e) => setBulkTextInput(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
                            />
                            <button
                                type="button"
                                onClick={handleBulkPaste}
                                disabled={!bulkTextInput.trim()}
                                className="w-full px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Parse & Add Students
                            </button>
                        </div>

                        {/* Display added students */}
                        {bulkStudents.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                    Added Students:
                                </label>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {bulkStudents.map((student, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                                        >
                                            <span className="text-sm text-slate-900 dark:text-white">
                                                <span className="font-semibold">{student.registerNumber}</span>
                                                {' - '}
                                                {student.name}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStudent(index)}
                                                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium"
                                            >
                                                ✕ Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 p-2 rounded">
                            💡 Bulk requests are for teams/groups attending events together. All students will share the same date, periods, and approval workflow.
                        </p>
                    </div>
                )}

                {/* Date Selection */}
                <Input
                    label="Date *"
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => {
                        console.log('📅 Date selected:', e.target.value);
                        setDate(e.target.value);
                    }}
                    required
                />

                {/* Period Selection */}
                <div>
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
                            Selected: {periods.sort((a, b) => a - b).join(', ')}
                        </p>
                    )}
                </div>

                {/* Faculty selection for each period */}
                {periods.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                            Select Faculty for Each Period *
                        </label>
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                            {periods.sort((a, b) => a - b).map(period => (
                                <div key={period} className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[80px]">
                                        Period {period}:
                                    </span>
                                    <select
                                        value={periodFacultyMapping[period.toString()] || ''}
                                        onChange={(e) => handlePeriodFacultyChange(period, e.target.value)}
                                        className="flex-1 px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select faculty...</option>
                                        {facultyList.map(faculty => (
                                            <option key={faculty.id} value={faculty.id}>
                                                {faculty.name} - {faculty.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                            💡 Select the faculty member who teaches each period on this date
                        </p>
                    </div>
                )}

                <div>
                    <Select
                        label="Event Incharge Faculty *"
                        id="event-incharge"
                        value={eventIncharge}
                        onChange={(e) => {
                            const selectedFaculty = facultyList.find(f => f.name === e.target.value);
                            console.log('👨‍🏫 Event coordinator selected:', selectedFaculty?.name);
                            setEventIncharge(e.target.value);
                            setEventInchargeFacultyId(selectedFaculty?.id || '');
                        }}
                        required
                        disabled={isLoadingFaculty}
                    >
                        <option value="">
                            {isLoadingFaculty ? 'Loading faculty...' : 'Select a faculty member'}
                        </option>
                        {facultyList.map(f => (
                            <option key={f.id} value={f.name}>
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
                        <span className={`ml-2 text-xs ${purpose.trim().length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                            ({purpose.trim().length}/10 characters minimum)
                        </span>
                    </label>
                    <textarea
                        id="purpose"
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200"
                        value={purpose}
                        onChange={(e) => {
                            setPurpose(e.target.value);
                            console.log('📝 Purpose updated:', e.target.value.length, 'characters');
                        }}
                        placeholder="Describe the event/activity and reason for attendance request (minimum 10 characters)..."
                        required
                    />
                </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || isLoadingFaculty}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
            </div>
        </form>
    );
};

export default NewRequestForm;
