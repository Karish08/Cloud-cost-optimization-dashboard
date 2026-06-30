import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ onRefresh, viewTitle, notification, showToast }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncing, setSyncing] = useState(false);

  const getActiveMenuClass = (path) => {
    return location.pathname === path
      ? 'bg-[rgba(124,58,237,0.15)] text-textPrimary border-l-2 border-[#7c3aed] font-semibold'
      : 'text-textSecondary hover:text-textPrimary hover:bg-[rgba(255,255,255,0.04)]';
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    showToast("Synchronizing multicloud cost metrics and analyzing resources...", "info");
    try {
      await onRefresh();
      showToast("Multi-cloud synchronization finished successfully.", "success");
    } catch (error) {
      showToast("Failed to sync cloud costs: " + error.message, "danger");
    } finally {
      setSyncing(false);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const userInitials = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-bgDark">
      {/* Sidebar */}
      <aside className="w-[260px] bg-bgSidebar border-r border-borderColor flex flex-col p-7 flex-shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <span className="text-2xl">☁️</span>
          <span className="font-extrabold text-xl bg-grad-cosmic bg-clip-text text-transparent">CloudCost</span>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <Link to="/" className={`flex items-center gap-3 py-3 px-4 rounded-lg text-[15px] transition-all duration-300 ${getActiveMenuClass('/')}`}>
            <span>📊</span> Overview
          </Link>
          <Link to="/resources" className={`flex items-center gap-3 py-3 px-4 rounded-lg text-[15px] transition-all duration-300 ${getActiveMenuClass('/resources')}`}>
            <span>🖥️</span> Cloud Resources
          </Link>
          <Link to="/recommendations" className={`flex items-center gap-3 py-3 px-4 rounded-lg text-[15px] transition-all duration-300 ${getActiveMenuClass('/recommendations')}`}>
            <span>⚡</span> Recommendations
          </Link>
        </nav>

        <div className="flex flex-col gap-5 border-t border-borderColor pt-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-grad-primary flex items-center justify-center font-bold text-white">
              {userInitials}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold text-textPrimary truncate">{user?.name || 'User'}</span>
              <span className="text-xs text-textSecondary truncate">{user?.email || 'user@company.com'}</span>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="w-full bg-[rgba(255,255,255,0.05)] text-textPrimary border border-borderColor hover:bg-[rgba(255,255,255,0.1)] hover:border-borderHover font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto p-9 flex flex-col gap-8 relative">
        {/* Header bar */}
        <header className="flex justify-between items-center border-b border-borderColor pb-6">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-textPrimary">{viewTitle}</h1>
            <p className="text-textSecondary text-sm mt-1">Real-time multicloud billing intelligence and recommendations</p>
          </div>
          <div>
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="bg-[rgba(124,58,237,0.1)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] hover:bg-[rgba(124,58,237,0.2)] hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all duration-300 disabled:opacity-50 text-sm"
            >
              <span>🔄</span> {syncing ? 'Syncing...' : 'Sync Multi-Cloud'}
            </button>
          </div>
        </header>

        {/* Global Notifications/Toast */}
        {notification.message && (
          <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg text-sm border shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
            notification.type === 'success' ? 'bg-[rgba(16,185,129,0.1)] text-[#34d399] border-[rgba(16,185,129,0.2)]' :
            notification.type === 'info' ? 'bg-[rgba(59,130,246,0.1)] text-[#60a5fa] border-[rgba(59,130,246,0.2)]' :
            notification.type === 'warning' ? 'bg-[rgba(245,158,11,0.1)] text-[#fbbf24] border-[rgba(245,158,11,0.2)]' :
            'bg-[rgba(239,68,68,0.1)] text-[#f87171] border-[rgba(239,68,68,0.2)]'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Dynamic Nested Routes */}
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
