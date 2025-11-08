
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
    if (requests.length === 0 && title) {
        return (
            <Card className="border border-slate-200 dark:border-slate-700">
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
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {title && (
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
                </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Periods
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Coordinator
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Purpose
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                Status
                            </th>
                            {actionsComponent && (
                                <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Actions
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {requests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {req.isBulkRequest ? (
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                                                    👥 BULK
                                                </span>
                                                {req.bulkStudents?.length || 0} Students
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Created by: {req.createdByName || req.studentName}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {req.studentName}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-700 dark:text-slate-300">
                                        {new Date(req.date).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {req.periods.map(p => (
                                            <span key={p} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-700 dark:text-slate-300 max-w-[150px] truncate" title={req.eventCoordinator}>
                                        {req.eventCoordinator}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-slate-700 dark:text-slate-300 max-w-[200px]">
                                        <div className="truncate" title={req.purpose}>
                                            {req.purpose}
                                        </div>
                                        {req.isBulkRequest && req.bulkStudents && req.bulkStudents.length > 0 && (
                                            <details className="mt-2">
                                                <summary className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                                                    View {req.bulkStudents.length} students
                                                </summary>
                                                <div className="mt-2 space-y-1 text-xs bg-slate-50 dark:bg-slate-700 p-2 rounded border border-slate-200 dark:border-slate-600 max-h-32 overflow-y-auto">
                                                    {req.bulkStudents.map((student, idx) => (
                                                        <div key={idx} className="text-slate-700 dark:text-slate-300">
                                                            <span className="font-semibold">{student.registerNumber}</span>: {student.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge status={req.status} />
                                    {req.status === 'Declined' && req.reason && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-[150px] truncate" title={req.reason}>
                                            {req.reason}
                                        </p>
                                    )}
                                </td>
                                {actionsComponent && (
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        {actionsComponent(req)}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceTable;
