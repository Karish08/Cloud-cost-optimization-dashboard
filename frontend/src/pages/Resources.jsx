import React, { useState, useEffect } from 'react';
import ResourceTable from '../components/ResourceTable';
import AddResourceModal from '../components/AddResourceModal';

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

  // Filter logic
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
    <div className="flex flex-col gap-6">
      <div className="bg-bgCard border border-borderColor rounded-2xl p-6 flex flex-col gap-6 shadow-main backdrop-blur-md">
        {/* Card Header & Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.03)] pb-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-grow max-w-[750px]">
            {/* Search Box */}
            <div className="relative flex-grow max-w-[450px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted">🔍</span>
              <input
                type="text"
                placeholder="Search resources by ID, name, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-borderColor rounded-lg pl-9 pr-4 py-2 text-sm text-textPrimary outline-none transition-all duration-300 focus:border-[#a78bfa] focus:bg-[rgba(255,255,255,0.08)]"
              />
            </div>

            {/* Provider Filter Tabs */}
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-textSecondary font-semibold whitespace-nowrap">Filter Provider:</span>
              <div className="flex bg-[rgba(255,255,255,0.03)] border border-borderColor rounded-lg p-0.5">
                {['ALL', 'AWS', 'AZURE', 'GCP'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => handleProviderFilterClick(prov)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 cursor-pointer ${
                      selectedProvider === prov
                        ? 'bg-[rgba(255,255,255,0.08)] text-textPrimary shadow-[0_2px_8px_rgba(0,0,0,0.25)]'
                        : 'text-textSecondary hover:text-textPrimary'
                    }`}
                  >
                    {prov === 'ALL' ? 'All' : prov}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add Resource Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-grad-primary text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(124,58,237,0.4)] active:translate-y-0 cursor-pointer transition-all duration-300 text-sm whitespace-nowrap align-self-end lg:align-self-auto"
          >
            <span>➕</span> Add Resource
          </button>
        </div>

        {/* Detailed Resources Table */}
        <ResourceTable resources={filteredResources} isPreview={false} />
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddSubmit}
      />
    </div>
  );
};

export default Resources;
