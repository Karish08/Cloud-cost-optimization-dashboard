import React, { useState, useEffect } from 'react';
import ResourceTable from '../components/ResourceTable';
import AddResourceModal from '../components/AddResourceModal';
import { Plus, Search } from 'lucide-react';

const Resources = ({ setViewTitle, resources, onAddResource }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setViewTitle('Cloud Resource Directory');
  }, [setViewTitle]);

  const handleProviderFilterClick = (provider) => {
    setSelectedProvider(provider);
  };

  const filteredResources = resources.filter((res) => {
    const matchesSearch =
      res.resourceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.resourceType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProvider =
      selectedProvider === 'ALL' || res.provider.toUpperCase() === selectedProvider.toUpperCase();

    return matchesSearch && matchesProvider;
  });

  const handleAddSubmit = async (payload) => {
    await onAddResource(payload);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <div className="premium-card p-6 sm:p-7 flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 border-b border-[rgba(255,255,255,0.04)] pb-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-grow">
            <div className="relative flex-grow max-w-[520px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted" />
              <input
                type="text"
                placeholder="Search resources by ID, name, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="premium-input w-full pl-10 pr-4 text-sm placeholder:text-textMuted"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-textSecondary font-semibold whitespace-nowrap">
                Provider
              </span>
              <div className="flex bg-[rgba(255,255,255,0.03)] border border-borderColor rounded-btn p-1 overflow-x-auto">
                {['ALL', 'AWS', 'AZURE', 'GCP'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => handleProviderFilterClick(prov)}
                    className={`h-8 px-3 text-xs font-semibold rounded-[10px] transition-all duration-220 cursor-pointer whitespace-nowrap ${
                      selectedProvider === prov
                        ? 'bg-accentBlue/15 text-textPrimary border border-accentBlue/25 shadow-glow-blue'
                        : 'text-textSecondary border border-transparent hover:text-textPrimary hover:bg-hoverMain'
                    }`}
                  >
                    {prov === 'ALL' ? 'All' : prov}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="premium-button bg-grad-primary text-white px-4 flex items-center justify-center gap-2 hover:shadow-glow-blue cursor-pointer text-sm whitespace-nowrap"
          >
            <Plus size={16} /> Add Resource
          </button>
        </div>

        <ResourceTable resources={filteredResources} isPreview={false} />
      </div>

      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default Resources;
