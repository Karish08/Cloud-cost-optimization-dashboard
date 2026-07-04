import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const activeItem = payload.find(p => p.value !== null && p.value !== undefined);
    if (!activeItem) return null;

    const data = activeItem.payload;
    const isActual = data.actualSpend !== null;
    const value = isActual ? data.actualSpend : data.forecastSpend;
    const labelType = isActual ? 'Actual Spend' : 'Forecast';
    
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });

    return (
      <div className="bg-[#1e293b] border border-[rgba(99,102,241,0.3)] rounded-[10px] py-3 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-xs pointer-events-none text-[#94a3b8] font-sans">
        <div className="text-white font-semibold mb-1">{formattedDate}</div>
        <div className="font-bold text-sm text-[#6366f1]">
          {labelType}: ${value.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

const SpendForecastChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[280px] text-textMuted text-sm font-sans">
        No forecast data available
      </div>
    );
  }

  const formatYAxis = (tickItem) => {
    return `$${Math.round(tickItem)}`;
  };

  const formatXAxis = (tickItem) => {
    try {
      const dObj = new Date(tickItem);
      return dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
    } catch (e) {
      return tickItem;
    }
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="grad-actual-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="grad-forecast-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="rgba(255, 255, 255, 0.04)"
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="rgba(255, 255, 255, 0.04)"
            tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.04)' }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={formatYAxis}
            stroke="rgba(255, 255, 255, 0.04)"
            tick={{ fill: '#475569', fontSize: 11, fontFamily: 'Inter' }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.04)' }}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Area for Actual Spend */}
          <Area
            type="monotone"
            dataKey="actualSpend"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#grad-actual-area)"
            connectNulls={true}
            dot={false}
            activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 3, fill: '#0a0f1e' }}
          />

          {/* Area for Forecast Spend */}
          <Area
            type="monotone"
            dataKey="forecastSpend"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#grad-forecast-area)"
            connectNulls={true}
            dot={false}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 3, fill: '#0a0f1e' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendForecastChart;
