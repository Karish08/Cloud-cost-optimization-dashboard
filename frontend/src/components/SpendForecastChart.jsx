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
    // Find the active payload item
    const activeItem = payload.find(p => p.value !== null && p.value !== undefined);
    if (!activeItem) return null;

    const data = activeItem.payload;
    const isActual = data.actualSpend !== null;
    const value = isActual ? data.actualSpend : data.forecastSpend;
    const labelType = isActual ? 'Actual Cost' : 'Predicted Cost';
    const color = isActual ? '#60a5fa' : '#c084fc';
    
    const formattedDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC'
    });

    return (
      <div className="bg-[#111224] border border-[#8b5cf6] rounded-lg p-3 shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-xs pointer-events-none">
        <div className="text-textSecondary mb-0.5">{formattedDate}</div>
        <div className="font-bold text-sm" style={{ color }}>
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
      <div className="flex items-center justify-center h-[280px] text-textMuted text-sm">
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
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="grad-forecast-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="0"
            vertical={false}
            stroke="rgba(255, 255, 255, 0.03)"
          />

          <XAxis
            dataKey="date"
            tickFormatter={formatXAxis}
            stroke="rgba(255, 255, 255, 0.2)"
            tick={{ fill: '#575c75', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />

          <YAxis
            tickFormatter={formatYAxis}
            stroke="rgba(255, 255, 255, 0.2)"
            tick={{ fill: '#575c75', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.08)' }}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Area for Actual Spend */}
          <Area
            type="monotone"
            dataKey="actualSpend"
            stroke="#3b82f6"
            strokeWidth={3}
            fill="url(#grad-actual-area)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 3, fill: '#080914' }}
          />

          {/* Area for Forecast Spend */}
          <Area
            type="monotone"
            dataKey="forecastSpend"
            stroke="#8b5cf6"
            strokeWidth={3}
            strokeDasharray="4 4"
            fill="url(#grad-forecast-area)"
            connectNulls={false}
            dot={false}
            activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 3, fill: '#080914' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SpendForecastChart;
