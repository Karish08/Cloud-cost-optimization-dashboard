import React, { useState } from 'react';

const RecommendationCard = ({ recommendation, onApply }) => {
  const [applying, setApplying] = useState(false);
  const { resource, actionType, reasoning, estimatedSavingsPerMonth } = recommendation;

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'SHUTDOWN':
        return 'bg-[rgba(239,68,68,0.15)] text-[#ef4444] border border-[rgba(239,68,68,0.25)]';
      case 'RESIZE':
        return 'bg-[rgba(245,158,11,0.15)] text-[#f59e0b] border border-[rgba(245,158,11,0.25)]';
      case 'CHEAPER_TIER':
        return 'bg-[rgba(59,130,246,0.15)] text-[#3b82f6] border border-[rgba(59,130,246,0.25)]';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const formatAction = (action) => {
    if (!action) return '';
    return action.replace('_', ' ');
  };

  const handleApplyClick = async () => {
    setApplying(true);
    try {
      await onApply(recommendation.id);
    } catch (e) {
      // Error handled by parent
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="bg-[rgba(255,255,255,0.02)] border border-borderColor rounded-xl p-4 flex flex-col gap-3 transition-all duration-300 hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.12)]">
      <div className="flex justify-between items-start gap-3 w-full min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <span className="text-sm font-semibold text-textPrimary truncate">{resource?.name}</span>
          <span className="text-xs text-textSecondary font-mono block truncate" title={resource?.resourceId}>
            {resource?.resourceId}
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-[6px] text-[10px] font-bold tracking-wide uppercase shrink-0 ${getActionBadgeClass(actionType)}`}>
          {formatAction(actionType)}
        </span>
      </div>

      <p className="text-[13px] text-textSecondary leading-relaxed">
        {reasoning}
      </p>

      <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.03)] pt-3 mt-1">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-textSecondary tracking-wider font-semibold">Estimated Savings</span>
          <span className="text-[15px] font-bold text-emeraldColor">${estimatedSavingsPerMonth?.toFixed(2)}/mo</span>
        </div>
        <button
          onClick={handleApplyClick}
          disabled={applying}
          className="bg-emeraldColor hover:bg-[#059669] text-white text-xs font-semibold py-1.5 px-3.5 rounded-md hover:shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {applying ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
