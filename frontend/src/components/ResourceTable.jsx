import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ResourceTable = ({ resources, isPreview = false }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isPreview && location.state?.highlightResourceId && resources.length > 0) {
      const rowId = `row-${location.state.highlightResourceId}`;
      const element = document.getElementById(rowId);
      if (element) {
        // Delay slightly to allow layout calculations to finish
        const scrollTimer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-row');
        }, 100);

        // Remove highlight class after animation finishes
        const fadeTimer = setTimeout(() => {
          element.classList.remove('highlight-row');
        }, 3100);
        
        return () => {
          clearTimeout(scrollTimer);
          clearTimeout(fadeTimer);
        };
      }
    }
  }, [location.state, resources, isPreview]);
  const truncate = (str, max) => {
    if (!str) return '';
    if (str.length <= max) return str;
    return str.substring(0, max) + '...';
  };

  const getProviderBadgeClass = (provider) => {
    switch (provider?.toUpperCase()) {
      case 'AWS':
        return 'bg-[rgba(255,153,0,0.15)] text-[#ff9900] border border-[rgba(255,153,0,0.25)]';
      case 'AZURE':
        return 'bg-[rgba(0,137,214,0.15)] text-[#0089d6] border border-[rgba(0,137,214,0.25)]';
      case 'GCP':
        return 'bg-[rgba(66,133,244,0.15)] text-[#4285f4] border border-[rgba(66,133,244,0.25)]';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  if (!resources || resources.length === 0) {
    return (
      <div className="w-full text-center py-8 text-textMuted text-sm">
        No resources tracked.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-textPrimary">
        <thead>
          <tr className="border-b border-borderColor">
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Resource ID</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Name</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Provider</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Type</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Region</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Daily Cost</th>
            <th className="p-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
          {resources.map((res) => (
            <tr 
              key={res.id} 
              id={`row-${res.id}`}
              className="transition-colors duration-200 hover:bg-[rgba(255,255,255,0.02)]"
            >
              <td className="p-4 font-mono text-[13px] text-textSecondary">
                <code>{isPreview ? truncate(res.resourceId, 16) : res.resourceId}</code>
              </td>
              <td className="p-4 font-semibold">{res.name}</td>
              <td className="p-4">
                <span className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold inline-block ${getProviderBadgeClass(res.provider)}`}>
                  {res.provider}
                </span>
              </td>
              <td className="p-4 font-mono text-[13px]">
                <code>{res.resourceType}</code>
              </td>
              <td className="p-4 text-textSecondary">{res.region}</td>
              <td className="p-4 font-bold">${res.costPerDay.toFixed(2)}</td>
              <td className="p-4">
                <StatusBadge status={res.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResourceTable;
