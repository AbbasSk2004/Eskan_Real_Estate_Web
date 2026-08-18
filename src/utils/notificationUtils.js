// Notification utility functions

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  PROPERTY_INQUIRY: 'property_inquiry',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  FAVORITE_ADDED: 'favorite_added',
  PRICE_CHANGE: 'price_change',
  NEW_LISTING: 'new_listing',
  SYSTEM: 'system'
};

export const getNotificationIcon = (type) => {
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

export const getNotificationColor = (type) => {
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

export const getNotificationActionUrl = (notification) => {
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

export const formatNotificationTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = (now - date) / (1000 * 60);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
  return date.toLocaleDateString();
};

export const groupNotificationsByDate = (notifications) => {
  const groups = {};
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupName;
    if (date.toDateString() === today.toDateString()) {
      groupName = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupName = 'Yesterday';
    } else if (date > new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)) {
      groupName = 'This Week';
    } else {
      groupName = 'Older';
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(notification);
  });
  
  return groups;
};

export const filterNotifications = (notifications, filter) => {
  switch (filter) {
    case 'unread':
      return notifications.filter(n => !n.read);
    case 'read':
      return notifications.filter(n => n.read);
    case 'all':
    default:
      return notifications;
  }
};

export const shouldShowNotificationToast = (notification, settings) => {
  if (!settings) return true;
  
  // Check if toast notifications are enabled
  if (settings.toast_notifications === false) {
    return false;
  }
  
  // Check notification type settings
  const typeEnabled = settings[`${notification.type}_enabled`] !== false;
  if (!typeEnabled) return false;
  
  // Check quiet hours
  if (settings.quiet_hours_enabled) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    const [startHour, startMinute] = settings.quiet_hours_start.split(':').map(Number);
    const [endHour, endMinute] = settings.quiet_hours_end.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (startTime <= endTime) {
      // Same day quiet hours
      if (currentTime >= startTime && currentTime <= endTime) {
        return false;
      }
    } else {
      // Overnight quiet hours
      if (currentTime >= startTime || currentTime <= endTime) {
        return false;
      }
    }
  }
  
  return true;
};

export const createBrowserNotification = (notification) => {
  // Check if browser notifications are supported
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notification');
    return;
  }

  // Check if permission is granted
  if (Notification.permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: false,
      silent: false
    });

    // Handle click on browser notification
    browserNotification.onclick = () => {
      const actionUrl = getNotificationActionUrl(notification);
      if (actionUrl) {
        window.focus();
        window.location.href = actionUrl;
      }
      browserNotification.close();
    };

    // Auto close after 5 seconds
    setTimeout(() => {
      browserNotification.close();
    }, 5000);
  } else if (Notification.permission !== 'denied') {
    // Request permission
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        createBrowserNotification(notification);
      }
    });
  }
};

export const getNotificationPriority = (type) => {
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

export const sortNotificationsByPriority = (notifications) => {
  return notifications.sort((a, b) => {
    const priorityA = getNotificationPriority(a.type);
    const priorityB = getNotificationPriority(b.type);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return new Date(b.created_at) - new Date(a.created_at);
  });
};

export const getNotificationTypeLabel = (type) => {
  const labels = {
    'message': 'Messages',
    'favorite_added': 'Property Favorites',
    'testimonial_approved': 'Testimonial Approvals',
    'property_inquiry': 'Property Inquiries',
    'property_approved': 'Property Approvals',
    'property_rejected': 'Property Rejections',
    'system': 'System Updates'
  };
  return labels[type] || 'Other';
};

export const getNotificationTypeDescription = (type) => {
  const descriptions = {
    'message': 'Notifications about new messages from other users',
    'favorite_added': 'Notifications when someone favorites your property',
    'testimonial_approved': 'Notifications when your testimonial is approved',
    'property_inquiry': 'Notifications about new property inquiries',
    'property_approved': 'Notifications when your property is approved',
    'property_rejected': 'Notifications when your property is rejected',
    'system': 'System-wide notifications and updates'
  };
  return descriptions[type] || 'General notifications';
};

// Browser notification support
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission;
  }
  return 'denied';
};

export const showBrowserNotification = (title, options = {}) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/img/icon-deal.png',
      badge: '/img/icon-deal.png',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }
  return null;
};

// Notification sound
export const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Could not play notification sound:', e));
  } catch (error) {
    console.log('Notification sound not available:', error);
  }
};

export const getNotificationStats = (notifications) => {
  const stats = {
    total: notifications.length,
    unread: 0,
    byType: {},
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    recent: 0 // Last 24 hours
  };

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  notifications.forEach(notification => {
    // Count unread
    if (!notification.read) {
      stats.unread++;
    }

    // Count by type
    if (!stats.byType[notification.type]) {
      stats.byType[notification.type] = 0;
    }
    stats.byType[notification.type]++;

    // Count by priority
    const priority = getNotificationPriority(notification.type);
    if (priority >= 4) {
      stats.byPriority.high++;
    } else if (priority >= 2) {
      stats.byPriority.medium++;
    } else {
      stats.byPriority.low++;
    }

    // Count recent
    if (new Date(notification.created_at) >= oneDayAgo) {
      stats.recent++;
    }
  });

  return stats;
};

export const markNotificationAsRead = async (notificationId, apiEndpoint) => {
  try {
    await apiEndpoint.markNotificationRead(notificationId);
    return true;
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    return false;
  }
};

export const deleteNotification = async (notificationId, apiEndpoint) => {
  try {
    await apiEndpoint.deleteNotification(notificationId);
    return true;
  } catch (error) {
    console.error('Failed to delete notification:', error);
    return false;
  }
};

export const bulkMarkAsRead = async (notificationIds, apiEndpoint) => {
  try {
    const promises = notificationIds.map(id => apiEndpoint.markNotificationRead(id));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Failed to bulk mark notifications as read:', error);
    return false;
  }
};

export const bulkDeleteNotifications = async (notificationIds, apiEndpoint) => {
  try {
    const promises = notificationIds.map(id => apiEndpoint.deleteNotification(id));
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Failed to bulk delete notifications:', error);
    return false;
  }
};