
import React from 'react';
import { RequestStatus } from '../../types';

interface BadgeProps {
  status: RequestStatus;
}

const statusStyles: Record<RequestStatus, string> = {
  [RequestStatus.APPROVED]: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  [RequestStatus.DECLINED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  [RequestStatus.PENDING_MENTOR]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  [RequestStatus.PENDING_HOD]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
};

export default Badge;
