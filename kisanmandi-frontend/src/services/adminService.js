import axiosInstance from './axiosInstance';

export const adminService = {
  getFarmers: (status) => axiosInstance.get('/admin/farmers', { params: { status } }),
  getFarmer: (id) => axiosInstance.get(`/admin/farmers/${id}`),
  approveFarmer: (id) => axiosInstance.patch(`/admin/farmers/${id}/approve`),
  rejectFarmer: (id, reason) => axiosInstance.patch(`/admin/farmers/${id}/reject`, { reason }),
  getFarmerDocumentUrl: (id) => axiosInstance.get(`/admin/farmers/${id}/document-url`),
  getAllCategories: () => axiosInstance.get('/admin/categories'),
  createCategory: (data) => axiosInstance.post('/admin/categories', data),
  updateCategory: (id, data) => axiosInstance.put(`/admin/categories/${id}`, data),
  setCategoryStatus: (id, active) => axiosInstance.patch(`/admin/categories/${id}/status`, { active })
};
