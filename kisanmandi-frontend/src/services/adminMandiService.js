import axiosInstance from './axiosInstance';

export const adminMandiService = {
  getStatus: () => axiosInstance.get('/api/admin/mandi/status'),
  getSyncLogs: (page = 0, size = 20) => axiosInstance.get('/api/admin/mandi/sync-logs', { params: { page, size } }),
  triggerSync: () => axiosInstance.post('/api/admin/mandi/sync')
};
