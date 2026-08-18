'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getNotificationIcon, 
  getNotificationColor,
  getNotificationActionUrl 
} from '../../utils/notificationUtils';

const NotificationToast = ({ 
  notification, 
  onClose, 
  autoClose = true,
  duration = 5000,
  position = 'top-right'
}) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);

    if (autoClose) {
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev - (100 / (duration / 100));
          if (newProgress <= 0) {
            handleClose();
            return 0;
          }
          return newProgress;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleClick = () => {
    const actionUrl = getNotificationActionUrl(notification);
    if (actionUrl) {
      router.push(actionUrl);
    }
    handleClose();
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-0 start-0';
      case 'top-right':
        return 'top-0 end-0';
      case 'bottom-left':
        return 'bottom-0 start-0';
      case 'bottom-right':
        return 'bottom-0 end-0';
      default:
        return 'top-0 end-0';
    }
  };

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
        return notification.data?.property_id ? `/properties/${notification.data.property_id}` : '/profile';
      case 'property_approved':
      case 'property_rejected':
        return notification.data?.property_id ? `/properties/${notification.data.property_id}` : '/profile';
      default:
        return null;
    }
  };

  const hasAction = getNotificationActionUrl(notification) !== null;

  return (
    <div
      className={`toast notification-toast ${isVisible ? 'show' : ''} mb-2`}
      style={{
        minWidth: '300px',
        maxWidth: '400px',
        transition: 'all 0.3s ease-in-out',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="toast-header">
        <div className="d-flex align-items-center">
          <i className={`fa ${getNotificationIcon(notification.type)} ${getNotificationColor(notification.type)} me-2`}></i>
          <strong className="me-auto">{notification.title}</strong>
          <small className="text-muted">Just now</small>
          <button
            type="button"
            className="btn-close ms-2"
            onClick={handleClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
      
      <div 
        className="toast-body" 
        onClick={hasAction ? handleClick : undefined}
        style={{ cursor: hasAction ? 'pointer' : 'default' }}
      >
        <p className="mb-0">{notification.message}</p>
        
        {/* Show additional metadata if available */}
        {notification.data && (
          <div className="mt-2">
            {notification.data.property_title && (
              <small className="text-muted d-block">
                <i className="fa fa-home me-1"></i>
                {notification.data.property_title}
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
          </div>
        )}
        
        {/* Action button if there's an action URL */}
        {hasAction && (
          <div className="mt-2">
            <button className="btn btn-sm btn-outline-primary">
              View Details
            </button>
          </div>
        )}
      </div>

      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar bg-primary"
            style={{ 
              width: `${progress}%`,
              height: '2px',
              transition: 'width 0.1s linear'
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default NotificationToast;