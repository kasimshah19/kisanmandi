import axiosInstance from './axiosInstance';

const cleanParams = (params) => {
  const cleaned = {};
  for (const key in params) {
    if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
      cleaned[key] = params[key];
    }
  }
  return cleaned;
};

export const reviewService = {
  createReview: (data) => axiosInstance.post('/customer/reviews', data).then(res => res.data),
  getPendingReviews: () => axiosInstance.get('/customer/reviews/pending').then(res => res.data),
  getPublicReviews: (farmerId, page = 0, size = 10) => axiosInstance.get(`/farmers/${farmerId}/reviews`, { params: { page, size } }).then(res => res.data),
  getFarmerReviews: (page = 0, size = 10) => axiosInstance.get('/farmer/reviews', { params: { page, size } }).then(res => res.data),
};

export const nearbyService = {
  getNearbyFarmers: (params) => axiosInstance.get('/nearby/farmers', { params: cleanParams(params) }).then(res => res.data),
  getNearbyProducts: (params) => axiosInstance.get('/nearby/products', { params: cleanParams(params) }).then(res => res.data),
};

export const farmerStatsService = {
  getStats: () => axiosInstance.get('/farmer/stats').then(res => res.data),
};

export const adminStatsService = {
  getStats: () => axiosInstance.get('/admin/stats').then(res => res.data),
};

export const adminUserService = {
  getUsers: (params) => axiosInstance.get('/admin/users', { params: cleanParams(params) }).then(res => res.data),
  getUser: (id) => axiosInstance.get(`/admin/users/${id}`).then(res => res.data),
  updateStatus: (id, data) => axiosInstance.patch(`/admin/users/${id}/status`, data).then(res => res.data),
};

export const adminProductService = {
  getProducts: (params) => axiosInstance.get('/admin/products', { params: cleanParams(params) }).then(res => res.data),
  updateModeration: (id, data) => axiosInstance.patch(`/admin/products/${id}/moderation`, data).then(res => res.data),
};

export const adminOrderService = {
  getOrders: (params) => axiosInstance.get('/admin/orders', { params: cleanParams(params) }).then(res => res.data),
  getOrder: (id) => axiosInstance.get(`/admin/orders/${id}`).then(res => res.data),
  cancelOrder: (id, data) => axiosInstance.patch(`/admin/orders/${id}/cancel`, data).then(res => res.data),
};

export const adminReviewService = {
  getReviews: (params) => axiosInstance.get('/admin/reviews', { params: cleanParams(params) }).then(res => res.data),
  updateVisibility: (id, data) => axiosInstance.patch(`/admin/reviews/${id}/visibility`, data).then(res => res.data),
};

export const publicFarmerService = {
  getFarmer: (id) => axiosInstance.get(`/farmers/${id}`).then(res => res.data),
};
