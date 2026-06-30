import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeClass = (statusVal) => {
    switch (statusVal) {
      case 'HEALTHY':
        return 'bg-[rgba(16,185,129,0.12)] text-[#34d399] border border-[rgba(16,185,129,0.2)]';
      case 'IDLE':
        return 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border border-[rgba(59,130,246,0.2)]';
      case 'OVER_PROVISIONED':
        return 'bg-[rgba(245,158,11,0.12)] text-[#fbbf24] border border-[rgba(245,158,11,0.2)]';
      case 'UNUSED_STORAGE':
        return 'bg-[rgba(239,68,68,0.12)] text-[#f87171] border border-[rgba(239,68,68,0.2)]';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const formatStatus = (statusVal) => {
    if (!statusVal) return '';
    return statusVal.replace('_', ' ');
  };

  return (
    <span className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold inline-block ${getBadgeClass(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
