import api from './axiosClient';

const CACHE_KEY = 'cached_notifications';
const CACHE_TIMESTAMP_KEY = 'notifications_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

// Cache utilities
const getCachedNotifications = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    
    if (!cached || !timestamp) {
      return null;
    }

    // Check if cache is still valid (within CACHE_DURATION)
    if (Date.now() - Number(timestamp) > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const setCachedNotifications = (notifications) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(notifications));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
};

// Retry utility with exponential backoff
const retryRequest = async (requestFn, maxRetries = 2, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on cancellation or client errors
      if (error.name === 'CanceledError' || 
          error.name === 'AbortError' || 
          (error.response && error.response.status < 500)) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

export const notificationService = {
  // Get all notifications for the current user
  getAllNotifications: async () => {
    try {
      // First, try to get cached notifications
      const cachedData = getCachedNotifications();
      
      // Make the API request
      const response = await api.get('/notifications');
      
      if (!response.data || !response.data.success) {
        // If API request fails but we have cache, return cached data
        if (cachedData) {
          return {
            data: {
              notifications: cachedData,
              fromCache: true
            },
            error: null
          };
        }
        throw new Error(response.data?.error || 'Failed to fetch notifications');
      }
      
      // Cache the new notifications
      const notifications = response.data.data || [];
      setCachedNotifications(notifications);
      
      return {
        data: {
          notifications,
          fromCache: false
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Try to return cached data if available
      const cachedData = getCachedNotifications();
      if (cachedData) {
        return {
          data: {
            notifications: cachedData,
            fromCache: true
          },
          error: null
        };
      }
      
      return {
        data: null,
        error: error.message
      };
    }
  },

  // Clear cache (useful when logging out)
  clearCache: () => {
    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { data: null, error };
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { data: null, error };
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return { data: response.data.count, error: null };
    } catch (error) {
      console.error('Error getting unread count:', error);
      return { data: 0, error };
    }
  },

  // Get notification statistics
  getNotificationStats: async () => {
    try {
      const response = await api.get('/notifications/stats');
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { data: null, error };
    }
  },

  // Get notifications by type
  getNotificationsByType: async (type) => {
    try {
      const response = await api.get(`/notifications/type/${type}`);
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error(`Error fetching ${type} notifications:`, error);
      return { data: null, error };
    }
  },

  // Delete notification
  delete: async (notificationId) => {
    const makeRequest = () => api.delete(`/notifications/${notificationId}`, {
      timeout: 5000
    });
    
    try {
      const response = await retryRequest(makeRequest);
      return { data: response.data, error: null };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return { data: null, error };
    }
  },

  // Bulk operations
  bulkMarkAsRead: async (notificationIds) => {
    try {
      const response = await api.put('/notifications/bulk-read', {
        notification_ids: notificationIds
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error bulk marking notifications as read:', error);
      return { data: null, error };
    }
  },

  bulkDelete: async (notificationIds) => {
    try {
      const response = await api.delete('/notifications/bulk-delete', {
        data: { notification_ids: notificationIds }
      });
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error bulk deleting notifications:', error);
      return { data: null, error };
    }
  },

  // Clear all notifications for the current user
  clearAllNotifications: async () => {
    try {
      // First get all notifications to get their IDs
      const { data: notificationsResponse } = await notificationService.getAllNotifications();
      if (!notificationsResponse?.notifications?.length) {
        return { data: [], error: null };
      }

      const notificationIds = notificationsResponse.notifications.map(n => n.id);
      
      // Then bulk delete them
      const response = await notificationService.bulkDelete(notificationIds);
      
      // Clear the cache after successful deletion
      notificationService.clearCache();
      
      return response;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return { data: null, error };
    }
  },

  // Test notification
  testNotification: async () => {
    try {
      const response = await api.post('/notifications/test');
      return { data: response.data.data, error: null };
    } catch (error) {
      console.error('Error sending test notification:', error);
      return { data: null, error };
    }
  },

  // Get notification types
  getNotificationTypes: () => {
    return [
      { value: 'all', label: 'All Notifications' },
      { value: 'message', label: 'Messages' },
      { value: 'favorite_added', label: 'Property Favorites' },
      { value: 'testimonial_approved', label: 'Testimonial Approvals' },
      { value: 'property_inquiry', label: 'Property Inquiries' },
      { value: 'property_approved', label: 'Property Approvals' },
      { value: 'property_rejected', label: 'Property Rejections' },
      { value: 'system', label: 'System Updates' }
    ];
  },

  // Format notification for display
  formatNotification: (notification) => {
    const now = new Date();
    const created = new Date(notification.created_at);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    let timeAgo;
    if (diffInMinutes < 1) {
      timeAgo = 'Just now';
    } else if (diffInMinutes < 60) {
      timeAgo = `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      timeAgo = `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      timeAgo = `${days}d ago`;
    }

    return {
      ...notification,
      timeAgo,
      formattedDate: created.toLocaleDateString(),
      formattedTime: created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  }
};

export default notificationService; 