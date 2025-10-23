
import React from 'react';
import { AttendanceRequest } from '../../types';
import Badge from '../ui/Badge';
import Card, { CardContent } from '../ui/Card';

interface AttendanceTableProps {
    requests: AttendanceRequest[];
    title: string;
    actionsComponent?: (request: AttendanceRequest) => React.ReactNode;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ requests, title, actionsComponent }) => {
    if (requests.length === 0) {
        return (
            <Card>
                <CardContent>
                    <div className="text-center py-12">
                         <h3 className="text-lg font-medium text-slate-900 dark:text-white">{title}</h3>
                         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No requests to display.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="overflow-x-auto">
            <h3 className="text-lg font-semibold p-4 border-b border-slate-200 dark:border-slate-700">{title}</h3>
            <div className="relative w-full">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700 dark:text-slate-300">
                    <tr>
                        <th scope="col" className="px-6 py-3">Student</th>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Periods</th>
                        <th scope="col" className="px-6 py-3">Coordinator</th>
                        <th scope="col" className="px-6 py-3">Purpose</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        {actionsComponent && <th scope="col" className="px-6 py-3">Actions</th>}
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600">
                            <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{req.studentName}</td>
                            <td className="px-6 py-4">{req.date}</td>
                            <td className="px-6 py-4">{req.periods.join(', ')}</td>
                            <td className="px-6 py-4">{req.eventCoordinator}</td>
                            <td className="px-6 py-4 max-w-xs truncate" title={req.purpose}>{req.purpose}</td>
                            <td className="px-6 py-4">
                                <Badge status={req.status} />
                                {req.status === 'Declined' && req.reason && (
                                    <p className="text-xs text-red-500 mt-1" title={req.reason}>Reason: {req.reason.substring(0,20)}...</p>
                                )}
                            </td>
                            {actionsComponent && <td className="px-6 py-4">{actionsComponent(req)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
            </div>
        </Card>
    );
};

export default AttendanceTable;
