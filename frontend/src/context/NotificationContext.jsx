import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [animateBell, setAnimateBell] = useState(false);
  const prevCountRef = useRef(0);

  const fetchNotifications = async (isFirstLoad = false) => {
    try {
      const response = await api.get('/notifications');
      const data = response.data || [];
      
      setNotifications(data);
      
      // Animate if count of notifications has increased between polls
      if (!isFirstLoad && data.length > prevCountRef.current) {
        setAnimateBell(true);
        setTimeout(() => setAnimateBell(false), 1500); // 1.5s animation
      }
      
      prevCountRef.current = data.length;
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Poll setup
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      prevCountRef.current = 0;
      return;
    }

    // First load
    fetchNotifications(true);

    const intervalId = setInterval(() => {
      fetchNotifications(false);
    }, 30000); // 30 seconds poll

    return () => clearInterval(intervalId);
  }, [isAuthenticated]);

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      animateBell,
      markAsRead,
      markAllAsRead,
      refreshNotifications: () => fetchNotifications(false)
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;
