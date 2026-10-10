import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const [countRes, recentRes] = await Promise.all([
        api.get('/notifications/unread-count'),
        api.get('/notifications/recent')
      ]);

      if (countRes.success && countRes.data) {
        setUnreadCount(countRes.data.unreadCount || 0);
      }
      if (recentRes.success && recentRes.data) {
        setRecentNotifications(recentRes.data);
      }
    } catch {
      // Silently fail if server is polling
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 45000); // Poll every 45s
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
      setRecentNotifications([]);
    }
  }, [user, fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setUnreadCount((prev) => Math.max(0, prev - 1));
      setRecentNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        recentNotifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
