import React, { useState } from 'react';

const AddResourceModal = ({ isOpen, onClose, onSubmit }) => {
  const [provider, setProvider] = useState('AWS');
  const [resourceType, setResourceType] = useState('COMPUTE');
  const [resourceName, setResourceName] = useState('');
  const [region, setRegion] = useState('');
  const [allocatedMemoryGB, setAllocatedMemoryGB] = useState('');
  const [actualUsedMemoryGB, setActualUsedMemoryGB] = useState('');
  const [allocatedCpuPercent, setAllocatedCpuPercent] = useState('');
  const [actualCpuPercent, setActualCpuPercent] = useState('');
  const [costPerDay, setCostPerDay] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        provider,
        resourceType,
        resourceName,
        region,
        allocatedMemoryGB: parseFloat(allocatedMemoryGB),
        actualUsedMemoryGB: parseFloat(actualUsedMemoryGB),
        allocatedCpuPercent: parseFloat(allocatedCpuPercent),
        actualCpuPercent: parseFloat(actualCpuPercent),
        costPerDay: parseFloat(costPerDay)
      });
      // Reset form
      setProvider('AWS');
      setResourceType('COMPUTE');
      setResourceName('');
      setRegion('');
      setAllocatedMemoryGB('');
      setActualUsedMemoryGB('');
      setAllocatedCpuPercent('');
      setActualCpuPercent('');
      setCostPerDay('');
    } catch (e) {
      // Error handled by parent
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[rgba(4,5,11,0.75)] backdrop-blur-md flex justify-center items-center z-[1000] p-4 transition-opacity duration-300">
      <div className="bg-bgCard backdrop-blur-3xl border border-borderColor shadow-main rounded-[20px] w-full max-w-[600px] p-8 relative transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center border-b border-borderColor pb-4 mb-6">
          <h2 className="text-xl font-bold bg-grad-cosmic bg-clip-text text-transparent">Add Cloud Resource Manually</h2>
          <button onClick={onClose} className="text-textSecondary hover:text-roseColor text-2xl cursor-pointer transition-colors duration-200">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Cloud Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)]"
              >
                <option value="AWS" className="bg-[#0c0c0d]">AWS</option>
                <option value="AZURE" className="bg-[#0c0c0d]">Azure</option>
                <option value="GCP" className="bg-[#0c0c0d]">GCP</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Resource Type</label>
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none cursor-pointer transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)]"
              >
                <option value="COMPUTE" className="bg-[#0c0c0d]">Compute (VM)</option>
                <option value="DATABASE" className="bg-[#0c0c0d]">Database</option>
                <option value="STORAGE" className="bg-[#0c0c0d]">Storage</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Resource Name</label>
              <input
                type="text"
                placeholder="e.g. Prod-App-Server"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Region</label>
              <input
                type="text"
                placeholder="e.g. us-east-1, eastus"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Allocated Memory (GB)</label>
              <input
                type="number"
                placeholder="e.g. 16"
                step="0.1"
                min="0"
                value={allocatedMemoryGB}
                onChange={(e) => setAllocatedMemoryGB(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Actual Used Memory (GB)</label>
              <input
                type="number"
                placeholder="e.g. 4.2"
                step="0.1"
                min="0"
                value={actualUsedMemoryGB}
                onChange={(e) => setActualUsedMemoryGB(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Allocated CPU (%)</label>
              <input
                type="number"
                placeholder="e.g. 100"
                step="0.1"
                min="0"
                value={allocatedCpuPercent}
                onChange={(e) => setAllocatedCpuPercent(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Actual Used CPU (%)</label>
              <input
                type="number"
                placeholder="e.g. 12.5"
                step="0.1"
                min="0"
                value={actualCpuPercent}
                onChange={(e) => setActualCpuPercent(e.target.value)}
                required
                className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wider text-textSecondary font-semibold">Cost Per Day ($)</label>
            <input
              type="number"
              placeholder="e.g. 4.50"
              step="0.01"
              min="0"
              value={costPerDay}
              onChange={(e) => setCostPerDay(e.target.value)}
              required
              className="bg-[rgba(255,255,255,0.03)] border border-borderColor text-textPrimary px-4 py-3 rounded-lg outline-none transition-all duration-300 focus:bg-[rgba(255,255,255,0.06)] focus:border-[#38bdf8] focus:shadow-[0_0_0_2px_rgba(56,189,248,0.15)] text-sm"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6 border-t border-borderColor pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="bg-[rgba(255,255,255,0.05)] border border-borderColor text-textPrimary px-6 py-2.5 rounded-lg cursor-pointer hover:bg-[rgba(255,255,255,0.1)] hover:border-borderHover transition-all duration-300 disabled:opacity-50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-grad-primary text-white font-semibold px-6 py-2.5 rounded-lg cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(56,189,248,0.4)] active:translate-y-0 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              {submitting ? 'Analyzing...' : 'Analyze & Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddResourceModal;
