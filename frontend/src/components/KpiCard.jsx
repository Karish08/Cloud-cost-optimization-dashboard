import React from 'react';

const KpiCard = ({ icon, title, value, subtitle, glowColor, iconBgColor, textColor }) => {
  const getGlowClass = (color) => {
    switch (color) {
      case 'blue':
        return 'hover:border-[rgba(56,189,248,0.4)] hover:shadow-glow-cyan';
      case 'pink':
        return 'hover:border-[rgba(236,72,153,0.4)] hover:shadow-glow-pink';
      case 'emerald':
        return 'hover:border-[rgba(16,185,129,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)]';
      case 'amber':
        return 'hover:border-[rgba(245,158,11,0.4)] hover:shadow-[0_8px_32px_rgba(245,158,11,0.15)]';
      default:
        return 'hover:border-borderHover';
    }
  };

  const getIconBgClass = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-[rgba(56,189,248,0.12)] text-[#38bdf8] shadow-[0_0_12px_rgba(56,189,248,0.25)] border border-[rgba(56,189,248,0.15)]';
      case 'pink':
        return 'bg-[rgba(236,72,153,0.12)] text-[#ec4899] shadow-[0_0_12px_rgba(236,72,153,0.25)] border border-[rgba(236,72,153,0.15)]';
      case 'emerald':
        return 'bg-[rgba(16,185,129,0.15)] text-[#34d399] shadow-[0_0_12px_rgba(16,185,129,0.25)] border border-[rgba(16,185,129,0.15)]';
      case 'amber':
        return 'bg-[rgba(245,158,11,0.15)] text-[#fbbf24] shadow-[0_0_12px_rgba(245,158,11,0.25)] border border-[rgba(245,158,11,0.15)]';
      default:
        return 'bg-gray-800 text-gray-400';
    }
  };

  return (
    <div className={`glass-panel glass-panel-hover rounded-2xl p-6 flex items-center gap-5 relative overflow-hidden ${getGlowClass(glowColor)}`}>
      {/* Subtle interior glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full filter blur-2xl opacity-[0.06] bg-current ${
        glowColor === 'blue' ? 'text-[#38bdf8]' :
        glowColor === 'pink' ? 'text-[#ec4899]' :
        glowColor === 'emerald' ? 'text-[#10b981]' :
        'text-[#fbbf24]'
      }`} />

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl relative z-10 ${getIconBgClass(iconBgColor)}`}>
        {icon}
      </div>
      <div className="flex flex-col relative z-10">
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
