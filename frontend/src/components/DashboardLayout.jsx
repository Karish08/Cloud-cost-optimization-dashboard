import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const DashboardLayout = ({ onRefresh, viewTitle, notification, showToast }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncing, setSyncing] = useState(false);
  const { notifications, unreadCount, animateBell, markAsRead, markAllAsRead } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }
    setDropdownOpen(false);
    navigate('/resources', { state: { highlightResourceId: notif.id } });
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'unknown';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'min' : 'mins'} ago`;
    } else if (diffHr < 24) {
      return `${diffHr} ${diffHr === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    }
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
          <div className="flex items-center gap-4 relative">
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="bg-[rgba(124,58,237,0.1)] text-[#c084fc] border border-[rgba(168,85,247,0.3)] hover:bg-[rgba(124,58,237,0.2)] hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 transition-all duration-300 disabled:opacity-50 text-sm cursor-pointer"
            >
              <span>🔄</span> {syncing ? 'Syncing...' : 'Sync Multi-Cloud'}
            </button>

            {/* Notification Bell and Dropdown */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`p-2.5 rounded-lg border border-borderColor bg-[rgba(255,255,255,0.02)] text-textPrimary hover:bg-[rgba(255,255,255,0.06)] hover:border-borderHover transition-all duration-300 relative flex items-center justify-center cursor-pointer ${
                  animateBell ? 'animate-bell-shake' : ''
                }`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#ef4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border border-[#080914]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 top-[38px] w-[320px] sm:w-[380px] bg-bgCard border border-borderColor rounded-2xl shadow-main backdrop-blur-md z-[1000] flex flex-col max-h-[400px] overflow-hidden">
                  {/* Dropdown Header */}
                  <div className="flex justify-between items-center px-4 py-3.5 border-b border-borderColor">
                    <span className="font-bold text-textPrimary text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-[#a78bfa] hover:text-[#c084fc] hover:underline font-semibold cursor-pointer"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Body */}
                  <div className="overflow-y-auto flex-grow divide-y divide-borderColor">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                        <CheckCircle2 size={32} className="text-emeraldColor" />
                        <div>
                          <p className="font-semibold text-textPrimary text-sm">All resources are healthy</p>
                          <p className="text-textSecondary text-xs mt-1">No alerts detected at this moment.</p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          className={`p-3.5 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 flex gap-3 relative ${
                            !n.isRead 
                              ? 'bg-[rgba(255,255,255,0.025)]' 
                              : ''
                          }`}
                          style={{
                            borderLeft: !n.isRead 
                              ? `3px solid ${n.type === 'CRITICAL' ? '#ef4444' : n.type === 'WARNING' ? '#f59e0b' : '#3b82f6'}`
                              : undefined
                          }}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {n.type === 'CRITICAL' && <AlertCircle size={16} className="text-[#ef4444]" />}
                            {n.type === 'WARNING' && <AlertTriangle size={16} className="text-[#f59e0b]" />}
                            {n.type === 'INFO' && <Info size={16} className="text-[#3b82f6]" />}
                          </div>
                          
                          <div className="flex-grow flex flex-col gap-1.5">
                            <p className="text-xs text-textPrimary leading-normal pr-1">{n.message}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold ${getProviderBadgeClass(n.provider)}`}>
                                  {n.provider}
                                </span>
                                {n.estimatedSavings > 0 && (
                                  <span className="text-[10px] font-bold text-[#10b981]">
                                    Save ${n.estimatedSavings.toFixed(2)}/mo
                                  </span>
                                )}
                              </div>
                              <span className="text-[9px] text-textMuted font-medium font-sans">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
