import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import api from '../services/api';

const DashboardLayout = ({ onRefresh, viewTitle, notification, showToast }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [syncing, setSyncing] = useState(false);
  const { notifications, unreadCount, animateBell, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [bellShake, setBellShake] = useState(false);
  const prevUnreadCount = useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevUnreadCount.current) {
      setBellShake(true);
      const timer = setTimeout(() => setBellShake(false), 1000);
      return () => clearTimeout(timer);
    }
    prevUnreadCount.current = unreadCount;
  }, [unreadCount]);

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
      ? 'bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-textPrimary font-semibold shadow-inner'
      : 'text-textSecondary hover:text-textPrimary hover:bg-[rgba(255,255,255,0.03)] border border-transparent';
  };

  const handleSyncClick = async () => {
    setSyncing(true);
    showToast("Synchronizing multicloud cost metrics and analyzing resources...", "info");
    try {
      await api.post('/costs/sync');
      await onRefresh();
      refreshNotifications();
      showToast("Multi-cloud synchronization finished successfully.", "success");
    } catch (error) {
      showToast("Failed to sync cloud costs: " + (error.response?.data?.message || error.message), "danger");
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
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-bgDark text-textPrimary relative">
      {/* Ambient Moving Light Blobs for Depth Parallax */}
      <div className="absolute top-[-50px] left-[5%] w-[450px] h-[450px] rounded-full bg-[rgba(56,189,248,0.08)] filter blur-[110px] pointer-events-none z-0 animate-float-slow-1"></div>
      <div className="absolute bottom-[-100px] right-[5%] w-[500px] h-[500px] rounded-full bg-[rgba(236,72,153,0.06)] filter blur-[120px] pointer-events-none z-0 animate-float-slow-2"></div>
      <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] rounded-full bg-[rgba(56,189,248,0.03)] filter blur-[90px] pointer-events-none z-0 animate-float-slow-1"></div>

      {/* Top Navbar */}
      <header className="w-full bg-[rgba(5,5,6,0.6)] backdrop-blur-md border-b border-borderColor py-4 px-8 flex items-center justify-between z-[1000] sticky top-0 flex-shrink-0 relative">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">☁️</span>
            <span className="font-extrabold text-xl bg-grad-cosmic bg-clip-text text-transparent tracking-tight">CloudCost</span>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-1.5">
            <Link to="/" className={`py-1.5 px-4 rounded-full text-[13px] transition-all duration-300 ${getActiveMenuClass('/')}`}>
              Overview
            </Link>
            <Link to="/resources" className={`py-1.5 px-4 rounded-full text-[13px] transition-all duration-300 ${getActiveMenuClass('/resources')}`}>
              Resources
            </Link>
            <Link to="/recommendations" className={`py-1.5 px-4 rounded-full text-[13px] transition-all duration-300 ${getActiveMenuClass('/recommendations')}`}>
              Recommendations
            </Link>
          </nav>
        </div>

        {/* Action controls & profile info */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSyncClick}
            disabled={syncing}
            className="bg-[rgba(56,189,248,0.06)] text-[#38bdf8] border border-[rgba(56,189,248,0.25)] hover:bg-[rgba(56,189,248,0.12)] hover:shadow-glow-cyan font-semibold py-1.5 px-4 rounded-full flex items-center gap-2 transition-all duration-300 disabled:opacity-50 text-xs cursor-pointer"
          >
            <span>🔄</span> {syncing ? 'Syncing...' : 'Sync Multi-Cloud'}
          </button>

          {/* Notification Bell and Dropdown */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`p-2 rounded-full border border-borderColor bg-[rgba(255,255,255,0.02)] text-textPrimary hover:bg-[rgba(255,255,255,0.06)] hover:border-borderHover transition-all duration-300 relative flex items-center justify-center cursor-pointer ${
                bellShake ? 'animate-bell-shake' : ''
              }`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#ec4899] text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse border border-[#050506]">
                  {unreadCount}
                </span>
              )}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 top-[36px] w-[320px] sm:w-[380px] bg-bgCard border border-borderColor rounded-2xl shadow-premium-3d backdrop-blur-md z-[1000] flex flex-col max-h-[400px] overflow-hidden">
                {/* Dropdown Header */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-borderColor">
                  <span className="font-bold text-textPrimary text-xs">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-[#38bdf8] hover:text-[#ec4899] hover:underline font-semibold cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                {/* Dropdown Body */}
                <div className="overflow-y-auto flex-grow divide-y divide-borderColor">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2">
                      <CheckCircle2 size={24} className="text-emeraldColor" />
                      <div>
                        <p className="font-semibold text-textPrimary text-xs">All resources are healthy</p>
                        <p className="text-textSecondary text-[10px] mt-0.5">No alerts detected.</p>
                      </div>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 cursor-pointer hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-200 flex gap-3 relative ${
                          !n.isRead 
                            ? 'bg-[rgba(255,255,255,0.015)]' 
                            : ''
                        }`}
                        style={{
                          borderLeft: !n.isRead 
                            ? `3px solid ${n.type === 'CRITICAL' ? '#ef4444' : n.type === 'WARNING' ? '#f59e0b' : '#38bdf8'}`
                            : undefined
                        }}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {n.type === 'CRITICAL' && <AlertCircle size={14} className="text-[#ef4444]" />}
                          {n.type === 'WARNING' && <AlertTriangle size={14} className="text-[#f59e0b]" />}
                          {n.type === 'INFO' && <Info size={14} className="text-[#38bdf8]" />}
                        </div>
                        
                        <div className="flex-grow flex flex-col gap-1">
                          <p className="text-xs text-textPrimary leading-normal pr-1">{n.message}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold ${getProviderBadgeClass(n.provider)}`}>
                                {n.provider}
                              </span>
                              {n.estimatedSavings > 0 && (
                                <span className="text-[9px] font-bold text-[#10b981]">
                                  Save ${n.estimatedSavings.toFixed(2)}/mo
                                </span>
                              )}
                            </div>
                            <span className="text-[8px] text-textMuted font-medium font-sans">
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

          {/* User profile capsule info */}
          <div className="flex items-center gap-2.5 bg-[rgba(255,255,255,0.03)] border border-borderColor py-1 pl-2 pr-3.5 rounded-full max-w-[200px]">
            <div className="w-6 h-6 rounded-full bg-grad-primary flex items-center justify-center font-bold text-white text-[10px] flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex flex-col overflow-hidden text-left leading-tight">
              <span className="text-[11px] font-semibold text-textPrimary truncate">{user?.name || 'User'}</span>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="bg-[rgba(255,255,255,0.04)] text-textSecondary hover:text-textPrimary border border-borderColor hover:bg-[rgba(255,255,255,0.08)] hover:border-borderHover font-semibold py-1 px-3.5 rounded-full transition-all duration-300 text-xs cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto px-8 py-8 flex flex-col gap-6 max-w-[1400px] w-full mx-auto relative z-10">
        {/* Dynamic Nested Title and Subtitle */}
        <div className="flex flex-col border-b border-borderColor pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-textPrimary">{viewTitle}</h1>
          <p className="text-textSecondary text-xs mt-1">Real-time multicloud billing intelligence and recommendations</p>
        </div>

        {/* Global Notifications/Toast */}
        {notification.message && (
          <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg text-sm border shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
            notification.type === 'success' ? 'bg-[rgba(16,185,129,0.1)] text-[#34d399] border-[rgba(16,185,129,0.2)]' :
            notification.type === 'info' ? 'bg-[rgba(56,189,248,0.1)] text-[#38bdf8] border-[rgba(56,189,248,0.2)]' :
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
