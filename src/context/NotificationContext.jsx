// src/context/NotificationContext.jsx
import { createContext, useContext, useState, useEffect, useMemo } from "react";

const NotificationContext = createContext();

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};

const NOTIF_KEY = "crm-compass-notifications-v2";

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setNotifications(parsed);
        } else {
          setNotifications([]);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications", e);
      setNotifications([]);
    }
  }, []);

  // Save
  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error("Failed to save notifications", e);
    }
  }, [notifications]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    const n = { id, message, type, timestamp: new Date(), read: false };
    setNotifications(p => [n, ...p]);
  };

  const markAsRead = (id) => {
    setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => setNotifications([]);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return (
    <NotificationContext.Provider value={{
      notifications,
      setNotifications,
      addNotification,
      markAsRead,
      clearAll,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};