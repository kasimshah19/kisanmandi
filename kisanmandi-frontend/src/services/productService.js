import axiosInstance from './axiosInstance';

export const productService = {
  getMyProducts: () => axiosInstance.get('/farmer/products'),
  createProduct: (formData) => axiosInstance.post('/farmer/products', formData),
  updateProduct: (id, formData) => axiosInstance.put(`/farmer/products/${id}`, formData),
  updateStock: (id, quantityAvailable) => axiosInstance.patch(`/farmer/products/${id}/stock`, { quantityAvailable }),
  updateStatus: (id, active) => axiosInstance.patch(`/farmer/products/${id}/status`, { active }),
  deleteProduct: (id) => axiosInstance.delete(`/farmer/products/${id}`),

  // Public: strip empty params before sending
  getPublicProducts: (params) => {
    const clean = {};
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') clean[k] = v;
    });
    return axiosInstance.get('/products', { params: clean });
  },

  getPublicProduct: (id) => axiosInstance.get(`/products/${id}`)
};
