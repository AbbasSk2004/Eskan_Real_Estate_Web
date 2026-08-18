'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import NotificationToast from './NotificationToast';
import { createBrowserNotification, shouldShowNotificationToast } from '../../utils/notificationUtils';

const NotificationManager = () => {
  const { isAuthenticated, notifications, settings: notificationSettings, markAsRead } = useNotification();
  const [toastNotifications, setToastNotifications] = useState([]);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Handle new notifications
  useEffect(() => {
    if (!isAuthenticated || !notifications.length) return;

    // Get the latest notification
    const latestNotification = notifications[0];
    
    // Check if this is a new notification we haven't processed
    if (latestNotification && latestNotification.id !== lastNotificationId) {
      setLastNotificationId(latestNotification.id);
      
      // Only show toast for new unread notifications
      if (!latestNotification.read) {
        handleNewNotification(latestNotification);
      }
    }
  }, [notifications, lastNotificationId, isAuthenticated]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPageVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleNewNotification = useCallback((notification) => {
    // Check if notification should be shown based on settings
    if (!shouldShowNotificationToast(notification, notificationSettings)) {
      return;
    }

    // Create browser notification if enabled and page is not visible
    if (notificationSettings?.browserNotifications && !isPageVisible) {
      createBrowserNotification(notification);
    }

    // Show toast notification if enabled
    if (shouldShowNotificationToast(notification, notificationSettings)) {
      setToastNotifications(prev => [...prev, notification]);
    }
  }, [notificationSettings, isPageVisible]);

  const handleToastClose = useCallback((notificationId) => {
    setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
    markAsRead(notificationId);
  }, [markAsRead]);

  // Get notification priority for ordering
  const getNotificationPriority = (type) => {
    const priorities = {
      'message': 1,
      'favorite_added': 2,
      'testimonial_approved': 3,
      'property_inquiry': 5,
      'property_approved': 6,
      'property_rejected': 6,
      'system': 7
    };
    return priorities[type] || 8;
  };

  // Sort toast notifications by priority and time
  const sortedToastNotifications = toastNotifications.sort((a, b) => {
    const priorityA = getNotificationPriority(a.type);
    const priorityB = getNotificationPriority(b.type);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return new Date(a.created_at) - new Date(b.created_at);
  });

  return (
    <>
      {sortedToastNotifications.map(notification => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => handleToastClose(notification.id)}
        />
      ))}
    </>
  );
};

export default NotificationManager;