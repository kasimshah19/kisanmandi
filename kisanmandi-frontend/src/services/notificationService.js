import axiosInstance from './axiosInstance';

export const getNotifications = async (page = 0, size = 20, unreadOnly = false) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (unreadOnly) {
    params.append('unreadOnly', 'true');
  }
  const response = await axiosInstance.get(`/notifications?${params.toString()}`);
  return response.data;
};

export const getRecentNotifications = async () => {
  const response = await axiosInstance.get('/notifications/recent');
  return response.data;
};

export const getUnreadCount = async () => {
  const response = await axiosInstance.get('/notifications/unread-count');
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axiosInstance.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.post('/notifications/read-all');
  return response.data;
};

export const deleteNotification = async (id) => {
  const response = await axiosInstance.delete(`/notifications/${id}`);
  return response.data;
};

export const notificationService = {
  getNotifications,
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};

export default notificationService;
