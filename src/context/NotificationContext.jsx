import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext.jsx';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationService.js';

const NotificationCtx = React.createContext(null);

export function useNotifications() {
  return useContext(NotificationCtx);
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.id) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await fetchNotifications(user.id);
        setNotifications(data);
      } catch (error) {
        console.error('Notification load error', error);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [user]);

  async function refreshNotifications() {
    if (!user?.id) return;
    try {
      const data = await fetchNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Notification refresh error', error);
    }
  }

  async function markRead(notificationId) {
    try {
      const updated = await markNotificationRead(notificationId);
      setNotifications(prev => prev.map(n => (n.id === updated.id ? updated : n)));
    } catch (error) {
      console.error('Notification mark read error', error);
    }
  }

  async function markAllRead() {
    if (!user?.id) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Notification mark all read error', error);
    }
  }

  return (
    <NotificationCtx.Provider value={{ notifications, loading, refreshNotifications, markRead, markAllRead }}>
      {children}
    </NotificationCtx.Provider>
  );
}
