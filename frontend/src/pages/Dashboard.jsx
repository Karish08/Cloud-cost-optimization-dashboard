import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import SpendForecastChart from '../components/SpendForecastChart';
import ResourceTable from '../components/ResourceTable';
import RecommendationCard from '../components/RecommendationCard';
import { useNotifications } from '../context/NotificationContext';

const Dashboard = ({
  setViewTitle,
  costSummary,
  costForecast,
  resources,
  recommendations,
  onApplyRecommendation
}) => {
  const navigate = useNavigate();
  const { notifications } = useNotifications();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    setViewTitle('Cost Overview');
  }, [setViewTitle]);

  // Format currency helper
  const formatCurrency = (val) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

  // Sorting highest costing resources
  const sortedResources = [...resources]
    .sort((a, b) => b.costPerDay - a.costPerDay)
    .slice(0, 5);

  // Active unapplied recommendations
  const activeRecs = recommendations.filter((r) => !r.isApplied);

  const criticalAlerts = notifications.filter(n => n.type === 'CRITICAL');
  const showBanner = criticalAlerts.length > 0 && !bannerDismissed;
  const totalCriticalWaste = criticalAlerts.reduce((sum, item) => sum + item.estimatedSavings, 0);

  return (
    <div className="flex flex-col gap-8 animate-fade-in-up">
      {showBanner && (
        <div className="bg-red-600 text-white px-6 py-4 rounded-xl flex justify-between items-center font-bold shadow-lg transition-all duration-300">
          <div className="flex items-center gap-1.5 flex-grow">
            <span>⚠ {criticalAlerts.length} critical resources detected — wasting an estimated ${totalCriticalWaste.toFixed(0)}/month.</span>
            <button
              onClick={() => navigate('/recommendations')}
              className="underline hover:text-red-100 transition-colors ml-1 cursor-pointer font-bold text-left bg-transparent border-none p-0 inline"
            >
              View Recommendations &rarr;
            </button>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[rgba(255,255,255,0.2)] transition-colors cursor-pointer font-bold text-sm flex-shrink-0 bg-transparent border-none"
          >
            ✕
          </button>
        </div>
      )}
      {/* KPI Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KpiCard
          icon="💸"
          title="Monthly Run Rate"
          value={formatCurrency(costSummary?.monthlyRunRate)}
          subtitle="Projected monthly spend"
          glowColor="blue"
          iconBgColor="blue"
        />
        <KpiCard
          icon="📅"
          title="Spent (Last 30 Days)"
          value={formatCurrency(costSummary?.totalSpent30Days)}
          subtitle="Sum of actual billing cycles"
          glowColor="pink"
          iconBgColor="pink"
        />
        <KpiCard
          icon="🌱"
          title="Potential Savings"
          value={formatCurrency(costSummary?.potentialSavings)}
          subtitle="Monthly idle & overprovision waste"
          glowColor="emerald"
          iconBgColor="emerald"
          textColor="text-emeraldColor"
        />
      </section>

      {/* Spend Forecast Chart and Quick Recommendations panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.75fr_1fr] gap-6">
        {/* Cost Trend & Forecast */}
        <div className="bg-bgCard border border-borderColor rounded-2xl p-6 flex flex-col gap-5 shadow-main backdrop-blur-md">
          <div className="flex justify-between items-center">
            <h2 className="text-[17px] font-semibold text-textPrimary">30-Day Cost Trend & 30-Day Forecast</h2>
            <div className="flex gap-4 text-xs text-textSecondary font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-sm bg-[#38bdf8] inline-block"></span> Actual Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-sm border-t-2 border-dashed border-[#ec4899] inline-block"></span> AI Forecast
              </span>
            </div>
          </div>
          <SpendForecastChart data={costForecast} />
        </div>

        {/* Quick Optimizations Panel */}
        <div className="bg-bgCard border border-borderColor rounded-2xl p-6 flex flex-col gap-5 shadow-main backdrop-blur-md max-h-[380px] overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="text-[17px] font-semibold text-textPrimary">Cost Optimizations</h2>
            <span className="px-2 py-0.5 bg-[rgba(56,189,248,0.12)] text-[#38bdf8] border border-[rgba(56,189,248,0.25)] rounded-[6px] text-xs font-bold">
              {activeRecs.length} Active
            </span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-grow">
            {activeRecs.length === 0 ? (
              <p className="text-center text-textMuted text-sm py-8">
                All systems optimized! No active waste detected.
              </p>
            ) : (
              activeRecs.slice(0, 3).map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  onApply={onApplyRecommendation}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monitored Resources table preview */}
      <div className="bg-bgCard border border-borderColor rounded-2xl p-6 flex flex-col gap-5 shadow-main backdrop-blur-md">
        <div className="flex justify-between items-center">
          <h2 className="text-[17px] font-semibold text-textPrimary">Monitored Cloud Resources</h2>
          <button
            onClick={() => navigate('/resources')}
            className="text-xs font-semibold text-[#38bdf8] hover:text-[#ec4899] hover:underline cursor-pointer transition-colors duration-200"
          >
            View Detailed Resource Directory &rarr;
          </button>
        </div>
        <ResourceTable resources={sortedResources} isPreview={true} />
      </div>
    </div>
  );
};

export default Dashboard;
