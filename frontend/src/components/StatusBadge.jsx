import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 'HEALTHY':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'IDLE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'OVER_PROVISIONED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'UNUSED_STORAGE':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      default:
        return 'bg-gray-800 text-gray-400 border-gray-700';
    }
  };

  const formatStatus = (statusVal) => {
    if (!statusVal) return '';
    return statusVal.replace('_', ' ');
  };

  return (
    <span className={`inline-block whitespace-nowrap border py-[5px] px-[12px] rounded-[20px] text-[0.75rem] font-bold tracking-[0.05em] uppercase ${getBadgeClass(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
