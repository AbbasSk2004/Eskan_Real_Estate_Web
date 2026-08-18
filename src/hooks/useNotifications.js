'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  showBrowserNotification, 
  playNotificationSound
} from '../utils/notificationUtils';
import notificationService from '../services/notificationService';
import { useToast } from './useToast';
import websocketService from '../services/websocket';

// Merge notification lists by id. The server snapshot is authoritative for
// ordering, but items already in local state (e.g. a notification that just
// arrived over WebSocket and is not yet visible to the snapshot query) are
// preserved — the same id can never appear twice.
const mergeById = (incoming, existing) => {
  const seen = new Set();
  const merged = [];
  [...incoming, ...existing].forEach((notification) => {
    if (!notification || seen.has(notification.id)) return;
    seen.add(notification.id);
    merged.push(notification);
  });
  return merged;
};

export const useNotifications = (options = {}) => {
  const {
    enableBrowserNotifications = true,
    enableSound = true,
    autoMarkRead = false
  } = options;

  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const toast = useToast();
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  const updateNotificationState = useCallback((updatedNotifications) => {
    if (mountedRef.current) {
      setNotifications(updatedNotifications);
      setUnreadCount(updatedNotifications.filter(n => !n.read).length);
    }
  }, []);

  // Baseline history fetch — ran once on mount and after WebSocket reconnects.
  // All subsequent updates are driven exclusively by WebSocket events.
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id || !mountedRef.current) {
      return;
    }

    try {
      if (!hasLoadedRef.current) {
        setLoading(true);
      }
      setError(null);

      const response = await notificationService.getAllNotifications();

      if (!mountedRef.current) return;

      if (response.error) {
        setError(response.error);
      } else {
        const newNotifications = response.data.notifications || [];
        hasLoadedRef.current = true;
        setNotifications(prev => {
          const merged = mergeById(newNotifications, prev);
          setUnreadCount(merged.filter(n => !n.read).length);
          return merged;
        });
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    mountedRef.current = true;

    if (isAuthenticated && user?.id) {
      fetchNotifications();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [isAuthenticated, user?.id, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await notificationService.markAsRead(notificationId);
      if (error) throw error;

      if (mountedRef.current) {
        const updatedNotifications = notifications.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        );
        updateNotificationState(updatedNotifications);
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to mark notification as read');
      }
    }
  }, [isAuthenticated, user, notifications, toast, updateNotificationState]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await notificationService.markAllAsRead();
      if (error) throw error;

      if (mountedRef.current) {
        const updatedNotifications = notifications.map(notification => ({ 
          ...notification, 
          read: true 
        }));
        updateNotificationState(updatedNotifications);
        toast.success('All notifications marked as read');
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to mark all notifications as read');
      }
    }
  }, [isAuthenticated, user, notifications, toast, updateNotificationState]);

  const bulkMarkAsRead = useCallback(async (notificationIds) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await notificationService.bulkMarkAsRead(notificationIds);
      if (error) throw error;

      if (mountedRef.current) {
        const updatedNotifications = notifications.map(notification => ({
          ...notification,
          read: notification.read || notificationIds.includes(notification.id)
        }));
        updateNotificationState(updatedNotifications);
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to mark notifications as read');
      }
    }
  }, [isAuthenticated, user, notifications, toast, updateNotificationState]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await notificationService.delete(notificationId);
      if (error) throw error;

      if (mountedRef.current) {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== notificationId)
        );

        if (notifications.find(n => n.id === notificationId && !n.read)) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }

        toast.success('Notification deleted');
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to delete notification');
      }
    }
  }, [isAuthenticated, user, notifications, toast]);

  // Add clearAllNotifications function after deleteNotification
  const clearAllNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      const { error } = await notificationService.clearAllNotifications();
      if (error) throw error;

      if (mountedRef.current) {
        setNotifications([]);
        setUnreadCount(0);
        toast.success('All notifications cleared');
      }
    } catch (err) {
      if (mountedRef.current) {
        toast.error('Failed to clear notifications');
        throw err; // Re-throw to handle in the component
      }
    }
  }, [isAuthenticated, user, toast]);

  // Auto mark as read when viewing
  useEffect(() => {
    if (autoMarkRead && notifications.length > 0 && isAuthenticated && user) {
      const unreadNotifications = notifications.filter(n => !n.read);
      unreadNotifications.forEach(notification => {
        markAsRead(notification.id);
      });
    }
  }, [autoMarkRead, notifications, markAsRead, isAuthenticated, user]);

  // WebSocket integration: listen for real-time notification events
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    // Establish a single socket connection (no-op if already connected)
    websocketService.connect();

    // Handlers for server-emitted events
    const handleCreated = ({ notification }) => {
      if (!notification) return;
      setNotifications(prev => {
        if (prev.some(n => n.id === notification.id)) return prev; // avoid duplicates
        const updated = [notification, ...prev];
        if (!notification.read) {
          setUnreadCount(updated.filter(n => !n.read).length);
        }
        // Optional UX: browser push + sound when the tab is hidden
        if (enableBrowserNotifications && document.hidden) {
          showBrowserNotification(notification.title, notification.message);
          if (enableSound) {
            playNotificationSound();
          }
        }
        return updated;
      });
    };

    const handleUpdated = ({ notification }) => {
      if (!notification) return;
      setNotifications(prev => {
        const updated = prev.map(n => (n.id === notification.id ? notification : n));
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    };

    const handleDeleted = ({ id }) => {
      if (!id) return;
      setNotifications(prev => {
        const updated = prev.filter(n => n.id !== id);
        setUnreadCount(updated.filter(n => !n.read).length);
        return updated;
      });
    };

    const handleConnection = ({ connected }) => {
      if (connected && hasLoadedRef.current) {
        // On reconnect pull the baseline once to catch anything missed.
        // Skipped while the mount baseline is still pending — that covers
        // the very first connect.
        fetchNotifications();
      }
    };

    // Subscribe to events and capture unsubscribe fns
    const unsubCreate = websocketService.subscribe('notification_created', handleCreated);
    const unsubUpdate = websocketService.subscribe('notification_updated', handleUpdated);
    const unsubDelete = websocketService.subscribe('notification_deleted', handleDeleted);
    const unsubConn = websocketService.subscribe('connection', handleConnection);

    // Cleanup subscriptions on unmount / auth change
    return () => {
      unsubCreate();
      unsubUpdate();
      unsubDelete();
      unsubConn();
    };
  }, [isAuthenticated, user?.id, enableBrowserNotifications, enableSound, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    bulkMarkAsRead,
    deleteNotification,
    clearAllNotifications,
    refetch: fetchNotifications
  };
};