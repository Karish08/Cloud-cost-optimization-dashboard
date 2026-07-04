import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KpiCard from '../components/KpiCard';
import SpendForecastChart from '../components/SpendForecastChart';
import ResourceTable from '../components/ResourceTable';
import RecommendationCard from '../components/RecommendationCard';
import { useNotifications } from '../context/NotificationContext';
import { CheckCircle } from 'lucide-react';

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
    <div className="flex flex-col gap-6 animate-fade-in-up">
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
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[20px] p-[28px] flex flex-col gap-5 shadow-main backdrop-blur-[10px]">
          <div className="flex justify-between items-center">
            <h2 className="text-[1.1rem] font-bold text-white font-display">30-Day Cost Trend & 30-Day Forecast</h2>
            <div className="flex gap-4 text-[0.8rem] text-[#94a3b8] font-medium font-sans">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 rounded-sm bg-[#6366f1] inline-block"></span> Actual Spend
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-1 rounded-sm border-t-2 border-dashed border-[#8b5cf6] inline-block"></span> Forecast
              </span>
            </div>
          </div>
          <SpendForecastChart data={costForecast} />
        </div>

        {/* Quick Optimizations Panel */}
        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[20px] p-6 flex flex-col gap-5 shadow-main backdrop-blur-[10px] max-h-[380px] overflow-hidden h-full">
          <div className="flex justify-between items-center">
            <h2 className="text-[1.2rem] font-bold text-white font-display">Cost Optimizations</h2>
            <span className="py-[4px] px-[12px] bg-[rgba(99,102,241,0.15)] text-[#6366f1] border border-[rgba(99,102,241,0.3)] rounded-full text-xs font-bold font-sans">
              {activeRecs.length} Active
            </span>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto pr-1 flex-grow">
            {activeRecs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <CheckCircle className="w-12 h-12 mb-3 text-[#10b981] animate-pulse" />
                <h3 className="text-[1.1rem] font-bold font-display text-white">All optimizations applied!</h3>
                <p className="text-sm text-textSecondary font-sans mt-1">Your cloud resources are fully optimized.</p>
              </div>
            ) : (
              activeRecs.map((rec, idx) => (
                <RecommendationCard
                  key={rec.id}
                  index={idx}
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
