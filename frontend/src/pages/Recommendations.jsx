import React, { useEffect } from 'react';
import RecommendationCard from '../components/RecommendationCard';

const Recommendations = ({ setViewTitle, recommendations, onApplyRecommendation }) => {
  useEffect(() => {
    setViewTitle('Active Savings Recommendations');
  }, [setViewTitle]);

  const activeRecs = recommendations.filter((r) => !r.isApplied);

  return (
    <div className="flex flex-col gap-6">
      {activeRecs.length === 0 ? (
        <div className="bg-bgCard border border-borderColor rounded-2xl p-12 text-center shadow-main backdrop-blur-md">
          <p className="text-textSecondary text-base">
            All systems optimized! No active waste detected.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeRecs.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onApply={onApplyRecommendation}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
