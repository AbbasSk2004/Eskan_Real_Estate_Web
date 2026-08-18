'use client';
import React, { useState } from 'react';

const NotificationItem = ({ 
  notification, 
  onMarkRead, 
  onDelete, 
  showActions = true,
  compact = false,
  allowClick = true
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message': return 'fa-envelope';
      case 'favorite_added': return 'fa-heart';
      case 'testimonial_approved': return 'fa-star';
      case 'property_inquiry': return 'fa-home';
      case 'property_approved': return 'fa-check-circle';
      case 'property_rejected': return 'fa-times-circle';
      case 'system': return 'fa-cog';
      default: return 'fa-bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message': return 'text-info';
      case 'favorite_added': return 'text-danger';
      case 'testimonial_approved': return 'text-warning';
      case 'property_inquiry': return 'text-primary';
      case 'property_approved': return 'text-success';
      case 'property_rejected': return 'text-danger';
      case 'system': return 'text-secondary';
      default: return 'text-primary';
    }
  };

  const getNotificationActionUrl = (notification) => {
    if (notification.data?.action_url) {
      return notification.data.action_url;
    }

    switch (notification.type) {
      case 'message':
        return '/messages';
      case 'favorite_added':
        return notification.data?.property_id ? `/properties/${notification.data.property_id}` : '/profile';
      case 'testimonial_approved':
        return '/profile';
      case 'property_inquiry':
        return notification.data?.property_id ? `/properties/${notification.data.property_id}` : '/inquiries';
      case 'property_approved':
      case 'property_rejected':
        return notification.data?.property_id ? `/properties/${notification.data.property_id}` : '/profile';
      default:
        return null;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkRead = () => {
    if (!notification.read && onMarkRead) {
      onMarkRead(notification.id);
    }
  };

  const handleDelete = async () => {
    if (onDelete && !isDeleting) {
      setIsDeleting(true);
      try {
        await onDelete(notification.id);
      } catch (error) {
        console.error('Error deleting notification:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleNotificationClick = () => {
    // Mark as read when clicked
    handleMarkRead();
    
    // Handle navigation based on notification type
    const actionUrl = getNotificationActionUrl(notification);
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  // Determine if this notification should navigate / show indicator
  const hasAction = allowClick && getNotificationActionUrl(notification) !== null;

  return (
    <div
      className={`notification-item border-bottom ${
        !notification.read ? 'bg-light' : ''
      } ${compact ? 'py-2' : 'p-3'} ${
        hasAction ? 'cursor-pointer' : ''
      }`}
      onClick={hasAction ? handleNotificationClick : undefined}
      style={{ 
        cursor: hasAction ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease'
      }}
    >
      <div className="d-flex align-items-start">
        {/* Notification Icon */}
        <div className={`me-3 ${compact ? 'mt-1' : 'mt-2'}`}>
          <i className={`fa ${getNotificationIcon(notification.type)} ${
            !notification.read ? getNotificationColor(notification.type) : 'text-muted'
          } ${compact ? '' : 'fa-lg'}`}></i>
        </div>

        {/* Notification Content */}
        <div className="flex-grow-1 min-width-0">
          <div className={`${!notification.read ? 'fw-bold' : ''} ${compact ? 'small' : ''}`}>
            {notification.title}
          </div>
          
          {!compact && (
            <div className="text-muted small mt-1">
              {notification.message}
            </div>
          )}
          
          <div className="d-flex align-items-center justify-content-between mt-2">
            <div className="text-muted small">
              <i className="fa fa-clock me-1"></i>
              {formatTime(notification.created_at)}
            </div>
            
            {/* Notification Actions */}
            {showActions && (
              <div className="notification-actions">
                {!notification.read && (
                  <button
                    className="btn btn-sm btn-link text-primary p-0 me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead();
                    }}
                    title="Mark as read"
                  >
                    <i className="fa fa-check"></i>
                  </button>
                )}
                
                <button
                  className="btn btn-sm btn-link text-danger p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  disabled={isDeleting}
                  title="Delete notification"
                >
                  {isDeleting ? (
                    <i className="fa fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa fa-trash"></i>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="ms-2">
            <span 
              className="badge bg-primary rounded-pill" 
              style={{ width: '8px', height: '8px', padding: 0 }}
            ></span>
          </div>
        )}
      </div>

      {/* Additional notification metadata (if available) */}
      {notification.data && (
        <div className="notification-metadata mt-2 ps-4">
          {notification.data.property_title && (
            <small className="text-muted">
              <i className="fa fa-home me-1"></i>
              Property: {notification.data.property_title}
            </small>
          )}
          
          {notification.data.sender_name && (
            <small className="text-muted d-block">
              <i className="fa fa-user me-1"></i>
              From: {notification.data.sender_name}
            </small>
          )}

          {notification.data.favoriter_name && (
            <small className="text-muted d-block">
              <i className="fa fa-heart me-1"></i>
              Favorited by: {notification.data.favoriter_name}
            </small>
          )}

          {notification.data.message_preview && (
            <small className="text-muted d-block">
              <i className="fa fa-comment me-1"></i>
              "{notification.data.message_preview}..."
            </small>
          )}

          {notification.data.rating && (
            <small className="text-muted d-block">
              <i className="fa fa-star me-1"></i>
              Rating: {notification.data.rating}/5
            </small>
          )}

          {notification.data.status && (
            <small className="text-muted d-block">
              <i className="fa fa-info-circle me-1"></i>
              Status: {notification.data.status}
            </small>
          )}
        </div>
      )}

      {/* Action indicator */}
      {allowClick && hasAction && (
        <div className="mt-2">
          <small className="text-primary">
            <i className="fa fa-external-link-alt me-1"></i>
            Click to view details
          </small>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;