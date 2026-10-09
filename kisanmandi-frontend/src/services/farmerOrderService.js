import axiosInstance from './axiosInstance';

// Farmer order management operations
export const farmerOrderService = {
  list: (params) => {
    const clean = {};
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') clean[k] = v;
    });
    return axiosInstance.get('/farmer/orders', { params: clean });
  },

  summary: () => axiosInstance.get('/farmer/orders/summary'),

  get: (id) => axiosInstance.get(`/farmer/orders/${id}`),

  updateStatus: (id, status, note) =>
    axiosInstance.patch(`/farmer/orders/${id}/status`, { status, note }),
};
