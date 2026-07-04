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
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-6 flex-grow">
            <div className="relative w-[380px] rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] backdrop-blur-[10px] py-3 px-4 transition-all duration-200 focus-within:border-[rgba(99,102,241,0.5)] focus-within:ring-[3px] focus-within:ring-[rgba(99,102,241,0.1)] focus-within:bg-[rgba(255,255,255,0.06)] flex items-center gap-3">
              <Search size={16} className="text-[#6366f1] shrink-0" />
              <input
                type="text"
                placeholder="Search resources by ID, name, or region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-textPrimary placeholder:text-[#475569] font-sans text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-textSecondary font-semibold whitespace-nowrap">
                Provider
              </span>
              <div className="flex gap-2 overflow-x-auto p-0.5">
                {['ALL', 'AWS', 'AZURE', 'GCP'].map((prov) => (
                  <button
                    key={prov}
                    onClick={() => handleProviderFilterClick(prov)}
                    className={`py-1.5 px-4 text-[0.8rem] font-semibold rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap border ${
                      selectedProvider === prov
                        ? 'bg-[rgba(99,102,241,0.15)] border-[rgba(99,102,241,0.4)] text-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                        : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#94a3b8] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
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
            className="bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] border-none rounded-[10px] py-2.5 px-5 font-display font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer hover:-translate-y-[1px] hover:shadow-[0_8px_25px_rgba(99,102,241,0.4)] hover:brightness-110 active:translate-y-0 whitespace-nowrap self-start xl:self-auto"
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
