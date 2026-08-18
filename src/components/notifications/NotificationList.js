'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '../../context/NotificationContext';
import { 
  getNotificationIcon, 
  getNotificationColor, 
  getNotificationActionUrl,
  formatNotificationTime,
  groupNotificationsByDate,
  filterNotifications,
  sortNotificationsByPriority,
  getNotificationTypeLabel
} from '../../utils/notificationUtils';

const NotificationList = ({ 
  filter = 'all',
  onNotificationUpdate,
  showMarkAllRead = false,
  showActions = false,
  groupByDate = false,
  className = '',
  limit = null
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(limit);
  const router = useRouter();
  const {
    notifications: contextNotifications,
    unreadCount: contextUnreadCount,
    loading: contextLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    bulkMarkAsRead,
    bulkDelete
  } = useNotification();

  // Filter and limit notifications
  const filteredNotifications = React.useMemo(() => {
    let filtered = filterNotifications(contextNotifications, filter);
    
    // Sort by priority and time
    filtered = sortNotificationsByPriority(filtered);
    
    if (currentLimit) {
      filtered = filtered.slice(0, currentLimit);
    }
    return filtered;
  }, [contextNotifications, filter, currentLimit]);

  // Group notifications by date if requested
  const groupedNotifications = React.useMemo(() => {
    if (groupByDate) {
      return groupNotificationsByDate(filteredNotifications);
    }
    return { 'All': filteredNotifications };
  }, [filteredNotifications, groupByDate]);

  // Update parent component with notification data
  useEffect(() => {
    if (onNotificationUpdate) {
      onNotificationUpdate({
        notifications: filteredNotifications,
        unreadCount: contextUnreadCount,
        total: contextNotifications.length
      });
    }
  }, [filteredNotifications, contextUnreadCount, contextNotifications.length, onNotificationUpdate]);

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to action URL if available
    const actionUrl = getNotificationActionUrl(notification);
    if (actionUrl) {
      router.push(actionUrl);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      await deleteNotification(notificationId);
    }
  };

  const handleSelectNotification = (notificationId, checked) => {
    if (checked) {
      setSelectedNotifications(prev => [...prev, notificationId]);
    } else {
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleBulkMarkAsRead = async () => {
    const unreadSelected = selectedNotifications.filter(id => {
      const notification = contextNotifications.find(n => n.id === id);
      return notification && !notification.read;
    });

    if (unreadSelected.length > 0) {
      await bulkMarkAsRead(unreadSelected);
    }
    setSelectedNotifications([]);
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      await bulkDelete(selectedNotifications);
      setSelectedNotifications([]);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Load more notifications function
  const loadMoreNotifications = () => {
    if (currentLimit) {
      setCurrentLimit(currentLimit + 5);
    }
  };

  if (contextLoading && !filteredNotifications.length) {
    return (
      <div className="d-flex justify-content-center py-4">
        <div className="spinner-border spinner-border-sm text-primary" role="status">
          <span className="visually-hidden">Loading notifications...</span>
        </div>
      </div>
    );
  }

  if (!contextLoading && filteredNotifications.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <i className="fa fa-bell-slash fa-3x mb-3"></i>
        <h5>No notifications</h5>
        <p>
          {filter === 'unread' 
            ? "You're all caught up! No unread notifications."
            : filter !== 'all'
            ? `No ${getNotificationTypeLabel(filter).toLowerCase()} notifications.`
            : "You don't have any notifications yet."
          }
        </p>
      </div>
    );
  }

  return (
    <div className={`notification-list ${className}`}>
      {/* Header with actions */}
      {(showMarkAllRead || showActions) && (
        <div className="notification-list-header d-flex justify-content-between align-items-center p-3 border-bottom">
          <div className="d-flex align-items-center">
            {showActions && (
              <div className="form-check me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={selectedNotifications.length === filteredNotifications.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </div>
            )}
            
            {selectedNotifications.length > 0 && (
              <span className="text-muted small">
                {selectedNotifications.length} selected
              </span>
            )}
          </div>

          <div className="d-flex gap-2">
            {/* Bulk actions */}
            {selectedNotifications.length > 0 && (
              <>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={handleBulkMarkAsRead}
                >
                  <i className="fa fa-check me-1"></i>
                  Mark Read
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={handleBulkDelete}
                >
                  <i className="fa fa-trash me-1"></i>
                  Delete
                </button>
              </>
            )}

            {/* Mark all as read */}
            {showMarkAllRead && contextUnreadCount > 0 && (
              <button
                className="btn btn-sm btn-primary"
                onClick={handleMarkAllAsRead}
              >
                <i className="fa fa-check-double me-1"></i>
                Mark All Read
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="notification-list-content">
        {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => (
          <div key={groupName} className="notification-group">
            {groupByDate && groupNotifications.length > 0 && (
              <div className="notification-group-header px-3 py-2 bg-light border-bottom">
                <small className="text-muted fw-bold">{groupName}</small>
              </div>
            )}

            {groupNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item d-flex align-items-start p-3 border-bottom cursor-pointer ${
                  !notification.read ? 'notification-unread bg-light' : ''
                } ${selectedNotifications.includes(notification.id) ? 'notification-selected' : ''}`}
                onClick={() => handleNotificationClick(notification)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection checkbox */}
                {showActions && (
                  <div className="form-check me-3 mt-1">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSelectNotification(notification.id, e.target.checked);
                      }}
                    />
                  </div>
                )}

                {/* Notification icon */}
                <div className="notification-icon me-3 mt-1">
                  <i className={`fa ${getNotificationIcon(notification.type)} ${getNotificationColor(notification.type)}`}></i>
                </div>

                {/* Notification content */}
                <div className="notification-content flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="notification-text">
                      <h6 className={`notification-title mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                        {notification.title}
                      </h6>
                      <p className="notification-message mb-1 text-muted">
                        {notification.message}
                      </p>
                      <small className="notification-time text-muted">
                        {formatNotificationTime(notification.created_at)}
                      </small>
                    </div>

                    {/* Action buttons */}
                    <div className="notification-actions d-flex gap-1">
                      {!notification.read && (
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                        >
                          <i className="fa fa-check"></i>
                        </button>
                      )}
                      
                      {showActions && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => handleDelete(notification.id, e)}
                          title="Delete notification"
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action URL indicator */}
                  {getNotificationActionUrl(notification) && (
                    <div className="mt-2">
                      <small className="text-primary">
                        <i className="fa fa-external-link-alt me-1"></i>
                        Click to view details
                      </small>
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="notification-unread-indicator ms-2 mt-2">
                    <span className="badge bg-primary rounded-pill" style={{ width: '8px', height: '8px' }}></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Load more button if there are more notifications */}
      {currentLimit && filteredNotifications.length >= currentLimit && (
        <div className="notification-list-footer p-3 text-center border-top">
          <button
            className="btn btn-outline-primary"
            onClick={loadMoreNotifications}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationList;