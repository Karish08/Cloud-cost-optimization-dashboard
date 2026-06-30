import React from 'react';

const KpiCard = ({ icon, title, value, subtitle, glowColor, iconBgColor, textColor }) => {
  const getGlowClass = (color) => {
    switch (color) {
      case 'violet':
        return 'hover:border-[rgba(124,58,237,0.4)] hover:shadow-[0_8px_32px_rgba(124,58,237,0.1)]';
      case 'blue':
        return 'hover:border-[rgba(59,130,246,0.4)] hover:shadow-[0_8px_32px_rgba(59,130,246,0.1)]';
      case 'emerald':
        return 'hover:border-[rgba(16,185,129,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.1)]';
      default:
        return 'hover:border-borderHover';
    }
  };

  const getIconBgClass = (color) => {
    switch (color) {
      case 'violet':
        return 'bg-[rgba(124,58,237,0.15)] text-[#c084fc]';
      case 'blue':
        return 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa]';
      case 'emerald':
        return 'bg-[rgba(16,185,129,0.15)] text-[#34d399]';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className={`bg-bgCard border border-borderColor rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 transform hover:-translate-y-0.5 relative overflow-hidden ${getGlowClass(glowColor)}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${getIconBgClass(iconBgColor)}`}>
        {icon}
      </div>
      <div className="flex flex-col">
        <h3 className="text-[13px] uppercase tracking-wider text-textSecondary font-semibold">
          {title}
        </h3>
        <div className={`text-[28px] font-extrabold my-0.5 tracking-tight ${textColor || 'text-textPrimary'}`}>
          {value}
        </div>
        <span className="text-xs text-textSecondary font-medium">
          {subtitle}
        </span>
      </div>
    </div>
  );
};

export default KpiCard;
