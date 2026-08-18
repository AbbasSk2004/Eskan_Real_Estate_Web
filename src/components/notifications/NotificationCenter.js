'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead } from '../../services/notifications.service';
import NotificationList from './NotificationList';
import './NotificationCenter.css';

const NotificationCenter = ({ isOpen, onClose, onNotificationUpdate, fullscreen = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated, currentUser } = useAuth();
  const router = useRouter();
  const fetchingRef = useRef(false);

  // Memoize fetchNotifications to prevent unnecessary recreations
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !currentUser || fetchingRef.current) {
      return;
    }

    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await getNotifications();
      
      if (response?.data) {
        setNotifications(response.data);
        
        // Update parent component with new notification data
        if (onNotificationUpdate) {
          onNotificationUpdate({
            notifications: response.data,
            unreadCount: response.data.filter(n => !n.read).length
          });
        }
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isAuthenticated, currentUser, onNotificationUpdate]);

  // Fetch notifications when component mounts and isOpen changes
  useEffect(() => {
    let mounted = true;

    if (isOpen && mounted) {
      fetchNotifications();
    }

    return () => {
      mounted = false;
    };
  }, [isOpen, fetchNotifications]);

  // Handle notification click
  const handleNotificationClick = useCallback(async (notification) => {
    try {
      // Mark as read if not already read
      if (!notification.read) {
        await markNotificationRead(notification.id);
        
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        ));
        
        // Update parent component
        if (onNotificationUpdate) {
          onNotificationUpdate({
            notifications,
            unreadCount: notifications.filter(n => !n.read).length - 1
          });
        }
      }

      // Navigate to the notification target if available
      if (notification.link) {
        onClose();
        router.push(notification.link);
      }
    } catch (err) {
      console.error('Error handling notification click:', err);
      // Show error toast or handle error appropriately
    }
  }, [notifications, router, onClose, onNotificationUpdate]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const containerClass = `notification-center ${fullscreen ? 'notification-center--fullscreen' : ''}`.trim();

  return (
    <div className={containerClass}>
      <div className="d-flex flex-column">
        {/* Header */}
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
          <h6 className="m-0 fw-bold">Notifications</h6>
          <div>
            <button 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close notifications"
            />
          </div>
        </div>

        {/* Content */}
        <div className="notification-center-content">
          {loading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading notifications...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center p-4">
              <div className="text-danger mb-3">
                <i className="fas fa-exclamation-circle fa-2x"></i>
              </div>
              <p className="text-muted mb-2">{error}</p>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={fetchNotifications}
              >
                Try Again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center p-4">
              <div className="text-muted mb-3">
                <i className="fas fa-bell-slash fa-2x"></i>
              </div>
              <p className="text-muted mb-0">No notifications yet</p>
            </div>
          ) : (
            <NotificationList 
              notifications={notifications}
              onNotificationClick={handleNotificationClick}
              showActions={true}
              limit={5}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;