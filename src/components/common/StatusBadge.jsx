import React from 'react';

const StatusBadge = ({ status, size = 'md' }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pending'
      },
      approved: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Approved'
      },
      rejected: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Rejected'
      },
      submitted: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        label: 'Submitted'
      },
      draft: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Draft'
      },
      under_review: {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        label: 'Under Review'
      },
      paid: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Paid'
      },
      unpaid: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Unpaid'
      },
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Active'
      },
      inactive: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Inactive'
      }
    };

    return configs[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status
    };
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${config.bg} ${config.text} ${sizeClasses[size]}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;