import axiosInstance from './axiosInstance';

export const getNotifications = async (page = 0, size = 20) => {
  const response = await axiosInstance.get(`/notifications?page=${page}&size=${size}`);
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
  const response = await axiosInstance.put(`/notifications/${id}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await axiosInstance.put('/notifications/read-all');
  return response.data;
};

export default {
  getNotifications,
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
