import axiosInstance from './axiosInstance';

// Customer order operations
export const orderService = {
  checkout: (addressId, paymentMode = 'COD') =>
    axiosInstance.post('/customer/orders/checkout', { addressId, paymentMode }),

  list: (params) => {
    // Remove empty/null params before sending
    const clean = {};
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') clean[k] = v;
    });
    return axiosInstance.get('/customer/orders', { params: clean });
  },

  get:    (id)           => axiosInstance.get(`/customer/orders/${id}`),
  cancel: (id, reason)   => axiosInstance.patch(`/customer/orders/${id}/cancel`, { reason }),
};
