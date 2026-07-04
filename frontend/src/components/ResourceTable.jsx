import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Cloud, CloudLightning, Zap } from 'lucide-react';

const ProviderBadge = ({ provider }) => {
  const config = {
    AWS: {
      icon: <Cloud size={12} />,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30'
    },
    AZURE: {
      icon: <CloudLightning size={12} />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/30'
    },
    GCP: {
      icon: <Zap size={12} />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30'
    }
  };
  const c = config[provider?.toUpperCase()] || config.AWS;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.color}`}>
      {c.icon} {provider}
    </span>
  );
};

const ResourceTable = ({ resources, isPreview = false }) => {
  const location = useLocation();

  useEffect(() => {
    if (!isPreview && location.state?.highlightResourceId && resources.length > 0) {
      const rowId = `row-${location.state.highlightResourceId}`;
      const element = document.getElementById(rowId);
      if (element) {
        const scrollTimer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-row');
        }, 100);

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

  if (!resources || resources.length === 0) {
    return (
      <div className="w-full text-center py-8 text-textMuted text-sm font-sans">
        No resources tracked.
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-textPrimary">
          <thead>
            <tr className="border-b border-borderColor">
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Resource ID</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Name</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Provider</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Type</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Region</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Daily Cost</th>
              <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[#475569] font-sans">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)] bg-bgCard">
            {resources.map((res) => (
              <tr 
                key={res.id} 
                id={`row-${res.id}`}
                className="transition-colors duration-150 hover:bg-[rgba(99,102,241,0.05)] cursor-pointer"
              >
                <td className="px-6 py-4 font-mono text-[0.75rem] text-[#475569]">
                  <code>{isPreview ? truncate(res.resourceId, 16) : res.resourceId}</code>
                </td>
                <td className="px-6 py-4 font-sans font-bold text-[0.95rem] text-white">
                  {res.name}
                </td>
                <td className="px-6 py-4">
                  <ProviderBadge provider={res.provider} />
                </td>
                <td className="px-6 py-4 font-mono text-[13px] text-textSecondary">
                  <code>{res.resourceType}</code>
                </td>
                <td className="px-6 py-4 text-textSecondary font-sans">{res.region}</td>
                <td className="px-6 py-4 font-mono text-[0.95rem] font-semibold text-white">
                  ${res.costPerDay.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={res.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceTable;
