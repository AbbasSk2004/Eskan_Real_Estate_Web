import api from './axiosClient';

// Get all notifications for the current user
export const getNotifications = () => api.get('/notifications');

// Mark a notification as read
export const markNotificationRead = (notificationId) => api.put(`/notifications/${notificationId}/read`);