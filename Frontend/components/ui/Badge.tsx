
import React from 'react';
import { RequestStatus } from '../../types';

interface BadgeProps {
  status: RequestStatus;
}

const statusConfig: Record<RequestStatus, { styles: string; icon: React.ReactNode }> = {
  [RequestStatus.APPROVED]: {
    styles: 'bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  [RequestStatus.DECLINED]: {
    styles: 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  },
  [RequestStatus.PENDING_MENTOR]: {
    styles: 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  [RequestStatus.PENDING_HOD]: {
    styles: 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
};

const statusLabels: Record<RequestStatus, string> = {
  [RequestStatus.PENDING_MENTOR]: 'Pending (Mentor)',
  [RequestStatus.PENDING_HOD]: 'Mentor Approved',
  [RequestStatus.APPROVED]: 'Approved',
  [RequestStatus.DECLINED]: 'Declined',
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
  const config = statusConfig[status];
  
  // If config is undefined, return a default badge
  if (!config) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
        {status}
      </span>
    );
  }
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${config.styles}`}
    >
      {config.icon}
      {statusLabels[status] || status}
    </span>
  );
};

export default Badge;
