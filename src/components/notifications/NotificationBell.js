'use client';
import React, { useRef, useEffect, useCallback, memo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const bellRef = useRef(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasNewNotification, setHasNewNotification] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [isInitialRender, setIsInitialRender] = React.useState(true);
  const [viewedNotifications, setViewedNotifications] = React.useState(new Set());
  const [isClearing, setIsClearing] = React.useState(false);
  const [isManualLoading, setIsManualLoading] = React.useState(false);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
    bulkMarkAsRead,
    clearAllNotifications
  } = useNotifications({
    enableBrowserNotifications: true,
    enableSound: true
  });

  // Update hasNewNotification when unreadCount changes
  useEffect(() => {
    if (unreadCount > 0) {
      setHasNewNotification(true);
      // Add animation when new notifications arrive, but not on initial render
      if (!isInitialRender) {
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    } else {
      setHasNewNotification(false);
      setViewedNotifications(new Set());
    }
    
    // After first update, mark initial render as complete
    setIsInitialRender(false);
  }, [unreadCount, isInitialRender]);

  // Handle document visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(true); // Force fetch when tab becomes visible
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = useCallback(async (notificationId) => {
    try {
      await markAsRead(notificationId);
      setViewedNotifications(prev => new Set([...prev, notificationId]));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [markAsRead]);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setHasNewNotification(false);
      // Mark all current notifications as viewed
      setViewedNotifications(new Set(notifications.map(n => n.id)));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [markAllAsRead, notifications]);

  const handleClearAll = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      setIsClearing(true);
      await clearAllNotifications();
      setHasNewNotification(false);
      setViewedNotifications(new Set());
      setIsOpen(false); // Close the dropdown after clearing
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    } finally {
      setIsClearing(false);
    }
  }, [clearAllNotifications]);

  const toggleNotifications = useCallback(async () => {
    if (!isOpen) {
      // When opening, mark all unread notifications as viewed and update their status
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);
      
      if (unreadIds.length > 0) {
        try {
          await bulkMarkAsRead(unreadIds);
          setViewedNotifications(new Set(notifications.map(n => n.id)));
        } catch (error) {
          console.error('Error marking notifications as read:', error);
        }
      }
    }
    setIsOpen(!isOpen);
  }, [isOpen, notifications, bulkMarkAsRead]);

  const handleManualRefresh = useCallback(async () => {
    setIsManualLoading(true);
    try {
      await fetchNotifications();
    } finally {
      setIsManualLoading(false);
    }
  }, [fetchNotifications]);

  // Close dropdown when clicking outside of the bell / dropdown area
  useEffect(() => {
    if (!isOpen) return; // Only attach listener when dropdown is open

    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup listener on unmount or when dropdown closes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Don't render anything if there's no user
  if (!user) return null;

  return (
    <div className="notification-bell" ref={bellRef}>
      <div 
        className={`icon-wrapper ${isAnimating ? 'animate-bell' : ''}`} 
        onClick={toggleNotifications}
      >
        <i className="fas fa-bell"></i>
        {hasNewNotification && (
          <span className={`badge ${isAnimating ? 'animate-badge' : ''}`}>
            {unreadCount > 0 && unreadCount}
          </span>
        )}
      </div>
      
      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="mark-all-read">
                  Mark all as read
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll} 
                  className="clear-all"
                  disabled={isClearing}
                >
                  {isClearing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Clearing...
                    </>
                  ) : (
                    'Clear All'
                  )}
                </button>
              )}
            </div>
          </div>
          
          <div className="notification-list">
            {loading && !notifications.length ? (
              <div className="no-notifications">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">
                <i className="fas fa-bell-slash"></i>
                <p>No notifications</p>
              </div>
            ) : (
              <>
                {isManualLoading && (
                  <div className="notification-loading-indicator">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>
                )}
                <div className={`notification-items ${isManualLoading ? 'loading' : ''}`}>
                  {notifications.map(notification => {
                    const isNew = !notification.read && !viewedNotifications.has(notification.id);
                    return (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.read ? 'read' : 'unread'} ${isNew ? 'new' : ''}`}
                        onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                      >
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                            {isNew && <span className="new-dot" />}
                          </div>
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">
                            {new Date(notification.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default memo(NotificationBell);