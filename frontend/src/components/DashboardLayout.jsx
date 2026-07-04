import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, AlertCircle, AlertTriangle, Info, CheckCircle2, LayoutDashboard, Server, Lightbulb, LogOut, RefreshCw, Cloud } from 'lucide-react';
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
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'AZURE':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'GCP':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700';
    }
  };

  const getActiveMenuClass = (path) => {
    const baseClass = 'flex items-center gap-3 py-3 px-4 rounded-[10px] text-[0.9rem] transition-all duration-150 w-full border-l-[3px] ';
    return location.pathname === path
      ? baseClass + 'bg-[rgba(99,102,241,0.15)] border-[#6366f1] text-[#6366f1] font-semibold shadow-[inset_0_0_20px_rgba(99,102,241,0.05)]'
      : baseClass + 'text-[#94a3b8] font-medium hover:text-white hover:bg-[rgba(255,255,255,0.05)] border-transparent';
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
    <div className="flex w-screen h-screen overflow-hidden bg-[#0a0f1e] text-textPrimary relative font-sans">
      {/* Ambient Moving Light Blobs for Depth Space Parallax */}
      <div className="absolute top-[-80px] right-[10%] w-[500px] h-[500px] rounded-full bg-[rgba(99,102,241,0.07)] filter blur-[100px] pointer-events-none z-0 animate-float-slow-1"></div>
      <div className="absolute bottom-[-120px] left-[15%] w-[550px] h-[550px] rounded-full bg-[rgba(139,92,246,0.06)] filter blur-[120px] pointer-events-none z-0 animate-float-slow-2"></div>

      {/* Sidebar Navigation */}
      <aside className="w-64 h-full bg-gradient-to-b from-[#0a0f1e] to-[#0d1528] border-r border-[rgba(99,102,241,0.25)] flex flex-col justify-between z-20 flex-shrink-0 relative animate-sidebar-slide-in">
        <div className="flex flex-col gap-6 py-6 px-4">
          {/* Glowing Brand Area */}
          {/* Glowing Brand Area */}
          <div className="flex items-center gap-3 px-2 pb-6 mb-2 border-b border-[rgba(255,255,255,0.06)] font-display text-[1.3rem]">
            <Cloud size={22} className="text-[#6366f1] shrink-0 animate-pulse" />
            <span className="font-extrabold text-white tracking-tight">
              Cloud<span className="text-[#6366f1] font-extrabold">Cost</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <Link to="/" className={getActiveMenuClass('/')}>
              <LayoutDashboard size={18} />
              <span>Overview</span>
            </Link>
            <Link to="/resources" className={getActiveMenuClass('/resources')}>
              <Server size={18} />
              <span>Resources</span>
            </Link>
            <Link to="/recommendations" className={getActiveMenuClass('/recommendations')}>
              <Lightbulb size={18} />
              <span>Recommendations</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer (Profile Info & Logout) */}
        <div className="p-4 border-t border-borderColor flex flex-col gap-3 bg-[rgba(13,21,40,0.55)]">
          <div className="flex items-center gap-3 bg-[rgba(255,255,255,0.02)] border border-borderColor py-2 px-3 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] flex items-center justify-center font-bold text-white text-[0.9rem] flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.4)] font-display">
              {userInitials}
            </div>
            <div className="flex flex-col overflow-hidden text-left leading-tight">
              <span className="text-[0.9rem] font-semibold text-white truncate font-sans">{user?.name || 'User'}</span>
              <span className="text-[0.75rem] text-[#475569] truncate font-sans">{user?.email || 'Admin'}</span>
            </div>
          </div>

          <button
            onClick={handleLogoutClick}
            className="w-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] text-[#ef4444] font-semibold py-2 px-4 rounded-[10px] flex items-center justify-center gap-2 transition-all duration-200 text-[0.85rem] cursor-pointer hover:bg-[rgba(239,68,68,0.2)]"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Wrapper */}
      <div className="flex-grow flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="w-full h-16 bg-[rgba(10,15,30,0.45)] backdrop-blur-md border-b border-borderColor px-8 flex items-center justify-between z-10 flex-shrink-0">
          <div className="flex items-center gap-2 text-[0.8rem] font-medium text-textSecondary font-sans">
            <span className="text-[#475569]">Dashboard</span>
            <span className="text-[#334155]">/</span>
            <span className="text-[#94a3b8]">{viewTitle}</span>
          </div>

          {/* Action controls & Notification Bell */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSyncClick}
              disabled={syncing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[20px] bg-[rgba(99,102,241,0.1)] text-[#6366f1] border border-[rgba(99,102,241,0.3)] text-[0.8rem] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:bg-[rgba(99,102,241,0.2)] font-sans"
            >
              <RefreshCw size={14} className={`text-[#6366f1] ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync Multi-Cloud'}</span>
            </button>

            {/* Notification Bell and Dropdown */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`p-1.5 rounded-full text-[#94a3b8] hover:text-white transition-all duration-200 relative flex items-center justify-center cursor-pointer ${
                  bellShake ? 'animate-bell-shake' : ''
                }`}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#6366f1] text-white text-[0.65rem] font-bold rounded-full flex items-center justify-center border border-[#0a0f1e] px-1 font-sans">
                    {unreadCount}
                  </span>
                )}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 top-[36px] w-[320px] sm:w-[380px] bg-[rgba(17,24,39,0.7)] border border-borderColor rounded-2xl shadow-premium-3d backdrop-blur-md z-[1000] flex flex-col max-h-[400px] overflow-hidden animate-page-fade-in">
                  {/* Dropdown Header */}
                  <div className="flex justify-between items-center px-4 py-3 border-b border-borderColor">
                    <span className="font-bold text-textPrimary text-xs font-display">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-[11px] text-[#6366f1] hover:text-[#8b5cf6] hover:underline font-semibold cursor-pointer"
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
                          <p className="font-semibold text-textPrimary text-xs font-display">All resources are healthy</p>
                          <p className="text-textSecondary text-[10px] mt-0.5">No alerts detected.</p>
                        </div>
                      </div>
                    ) : (
                      notifications.map((n) => {
                        let tintClass = 'hover:bg-[rgba(255,255,255,0.03)] ';
                        let borderLeftStyle = undefined;
                        
                        if (!n.isRead) {
                          tintClass += 'bg-[rgba(99,102,241,0.04)] ';
                          if (n.type === 'CRITICAL') {
                            tintClass += 'bg-red-500/5 ';
                            borderLeftStyle = '3px solid #ef4444';
                          } else if (n.type === 'WARNING') {
                            tintClass += 'bg-amber-500/5 ';
                            borderLeftStyle = '3px solid #f59e0b';
                          } else {
                            borderLeftStyle = '3px solid #6366f1';
                          }
                        } else {
                          tintClass += 'opacity-60 ';
                          if (n.type === 'CRITICAL') {
                            borderLeftStyle = '3px solid rgba(239, 68, 68, 0.4)';
                          } else if (n.type === 'WARNING') {
                            borderLeftStyle = '3px solid rgba(245, 158, 11, 0.4)';
                          } else {
                            borderLeftStyle = '3px solid rgba(99, 102, 241, 0.4)';
                          }
                        }

                        return (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 cursor-pointer transition-colors duration-200 flex gap-3 relative ${tintClass}`}
                            style={{ borderLeft: borderLeftStyle }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              {n.type === 'CRITICAL' && <AlertCircle size={14} className="text-[#ef4444]" />}
                              {n.type === 'WARNING' && <AlertTriangle size={14} className="text-[#f59e0b]" />}
                              {n.type === 'INFO' && <Info size={14} className="text-[#6366f1]" />}
                            </div>
                            
                            <div className="flex-grow flex flex-col gap-1">
                              <p className="text-xs text-textPrimary leading-normal pr-1">{n.message}</p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold ${getProviderBadgeClass(n.provider)}`}>
                                    {n.provider}
                                  </span>
                                  {n.estimatedSavings > 0 && (
                                    <span className="text-[9px] font-bold text-[#10b981] font-mono">
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
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main 
          className="flex-grow overflow-y-auto px-8 py-8 w-full max-w-[1400px] mx-auto relative z-10 animate-page-fade-in"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(99,102,241,0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(139,92,246,0.03) 0%, transparent 50%)`
          }}
        >
          {/* Dynamic Nested Title and Subtitle */}
          <div className="flex flex-col border-b border-borderColor pb-4 mb-6">
            <h1 className="text-[2.2rem] font-extrabold tracking-[-0.03em] font-display bg-gradient-to-br from-white to-[#94a3b8] bg-clip-text text-transparent">{viewTitle}</h1>
            <p className="text-[#64748b] text-[0.9rem] font-normal mt-1.5 font-sans">Real-time multicloud billing intelligence and recommendations</p>
          </div>

          {/* Global Notifications/Toast */}
          {notification.message && (
            <div className={`fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg text-sm border shadow-[0_10px_25px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 ${
              notification.type === 'success' ? 'bg-[rgba(16,185,129,0.1)] text-[#34d399] border-[rgba(16,185,129,0.2)]' :
              notification.type === 'info' ? 'bg-[rgba(99,102,241,0.1)] text-[#6366f1] border-[rgba(99,102,241,0.2)]' :
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
    </div>
  );
};

export default DashboardLayout;
