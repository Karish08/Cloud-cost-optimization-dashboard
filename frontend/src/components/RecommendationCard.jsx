import React, { useState } from 'react';

const RecommendationCard = ({ recommendation, onApply, index = 0 }) => {
  const [applying, setApplying] = useState(false);
  const { resource, actionType, reasoning, estimatedSavingsPerMonth } = recommendation;

  const getActionBadgeClass = (action) => {
    switch (action) {
      case 'SHUTDOWN':
        return 'bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-[#ef4444] rounded-[6px] py-[3px] px-[10px] text-[0.7rem] font-bold tracking-[0.05em]';
      case 'RESIZE':
        return 'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#f59e0b] rounded-[6px] py-[3px] px-[10px] text-[0.7rem] font-bold tracking-[0.05em]';
      case 'CHEAPER_TIER':
        return 'bg-[rgba(6,182,212,0.1)] border border-[rgba(6,182,212,0.25)] text-[#06b6d4] rounded-[6px] py-[3px] px-[10px] text-[0.7rem] font-bold tracking-[0.05em]';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700 py-[3px] px-[10px] text-[0.7rem] font-bold tracking-[0.05em] rounded-[6px]';
    }
  };

  const getActionBorderClass = (action) => {
    switch (action) {
      case 'SHUTDOWN':
        return 'border-l-[3px] border-[#ef4444]';
      case 'RESIZE':
        return 'border-l-[3px] border-[#f59e0b]';
      case 'CHEAPER_TIER':
        return 'border-l-[3px] border-[#06b6d4]';
      default:
        return 'border-l-[3px] border-borderColor';
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
    <div 
      className={`bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-[14px] p-5 mb-[10px] flex flex-col justify-between gap-4 transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] hover:-translate-y-[1px] animate-fade-in-stagger ${getActionBorderClass(actionType)}`}
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
    >
      <div className="flex justify-between items-start gap-3 w-full min-w-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1 text-left">
          <span className="text-base font-bold text-white truncate font-display">{resource?.name}</span>
          <span className="text-[0.72rem] text-[#475569] font-mono block mt-0.5 truncate" title={resource?.resourceId}>
            {resource?.resourceId}
          </span>
        </div>
        <span className={`uppercase shrink-0 font-sans ${getActionBadgeClass(actionType)}`}>
          {formatAction(actionType)}
        </span>
      </div>

      <p className="text-[0.83rem] text-[#94a3b8] leading-[1.6] my-3 text-left font-sans">
        {reasoning}
      </p>

      <div className="flex justify-between items-center border-t border-[rgba(255,255,255,0.04)] pt-3.5 mt-1">
        <div className="flex flex-col text-left">
          <span className="text-[0.65rem] font-bold text-[#475569] tracking-[0.1em] uppercase font-sans">Estimated Savings</span>
          <span className="text-[1.4rem] font-bold text-[#10b981] font-mono">${estimatedSavingsPerMonth?.toFixed(2)}/mo</span>
        </div>
        <button
          onClick={handleApplyClick}
          disabled={applying}
          className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] hover:brightness-110 text-white text-[0.85rem] font-bold py-[9px] px-[22px] rounded-[10px] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:-translate-y-[1px] active:scale-[0.98] transition-all duration-200 border-none disabled:opacity-50 disabled:cursor-not-allowed font-display cursor-pointer"
        >
          {applying ? 'Applying...' : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default RecommendationCard;
