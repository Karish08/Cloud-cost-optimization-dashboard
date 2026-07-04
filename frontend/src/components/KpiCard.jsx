import React, { useEffect, useState } from 'react';
import { Wallet, TrendingDown, AlertTriangle } from 'lucide-react';

const KpiCard = ({ icon, title, value, subtitle, glowColor, iconBgColor, textColor }) => {
  const numericString = value ? value.replace(/[^0-9.]/g, '') : '0';
  const targetNumber = parseFloat(numericString) || 0;
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = targetNumber;
    if (start === end) {
      setDisplayVal(end);
      return;
    }

    const duration = 1500; // 1.5 seconds count up
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutQuad curve
      const easeProgress = progress * (2 - progress);
      const currentVal = start + (end - start) * easeProgress;
      
      setDisplayVal(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [targetNumber]);

  const formatValue = (num) => {
    if (!value) return '';
    if (!value.includes('$')) {
      return Math.round(num).toString();
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(num);
  };

  const getCardStyle = () => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('run rate')) {
      return {
        bg: 'from-[rgba(99,102,241,0.15)] to-[rgba(99,102,241,0.05)] border-[rgba(99,102,241,0.25)]',
        circleBg: 'bg-[rgba(99,102,241,0.1)]',
        iconContainer: 'bg-[rgba(99,102,241,0.2)] text-[#6366f1]',
        delay: 0,
        valColor: 'text-white'
      };
    } else if (lowercaseTitle.includes('spent')) {
      return {
        bg: 'from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.05)] border-[rgba(139,92,246,0.25)]',
        circleBg: 'bg-[rgba(139,92,246,0.1)]',
        iconContainer: 'bg-[rgba(139,92,246,0.2)] text-[#8b5cf6]',
        delay: 100,
        valColor: 'text-white'
      };
    } else {
      return {
        bg: 'from-[rgba(16,185,129,0.15)] to-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.25)]',
        circleBg: 'bg-[rgba(16,185,129,0.1)]',
        iconContainer: 'bg-[rgba(16,185,129,0.2)] text-[#10b981]',
        delay: 200,
        valColor: 'text-[#10b981]'
      };
    }
  };

  const renderIcon = () => {
    const lowercaseTitle = title.toLowerCase();
    if (lowercaseTitle.includes('run rate') || lowercaseTitle.includes('spent')) {
      return <Wallet size={22} />;
    } else if (lowercaseTitle.includes('savings')) {
      return <TrendingDown size={22} />;
    } else {
      return <AlertTriangle size={22} />;
    }
  };

  const c = getCardStyle();
  const isLoading = !value || value === '$0.00' || value === '$0';

  return (
    <div 
      className={`bg-gradient-to-br ${c.bg} border rounded-[20px] p-[28px] flex justify-between items-start relative overflow-hidden backdrop-blur-[20px] transition-all duration-200 ease-in-out hover:-translate-y-[3px] hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]`}
      style={{
        animation: 'shimmer 0.5s ease forwards',
        animationDelay: `${c.delay}ms`,
        opacity: 0
      }}
    >
      {/* Decorative circle top-right */}
      <div className={`absolute w-[120px] h-[120px] rounded-full ${c.circleBg} -top-[30px] -right-[30px] pointer-events-none`} />

      <div className="flex flex-col relative z-10 text-left flex-grow">
        <h3 className="text-[0.7rem] font-sans font-bold tracking-[0.125em] uppercase text-[#64748b] mb-3">
          {title}
        </h3>
        {isLoading ? (
          <div className="h-10 w-36 bg-[rgba(255,255,255,0.06)] rounded-lg animate-pulse my-2"></div>
        ) : (
          <div className={`text-[2.4rem] font-display font-extrabold ${c.valColor} leading-none tracking-[-0.03em] my-1`}>
            {formatValue(displayVal)}
          </div>
        )}
        <span className="text-[0.78rem] text-[#475569] font-medium mt-2 font-sans">
          {subtitle}
        </span>
      </div>

      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 flex-shrink-0 mt-0.5 ${c.iconContainer}`}>
        {renderIcon()}
      </div>
    </div>
  );
};

export default KpiCard;
