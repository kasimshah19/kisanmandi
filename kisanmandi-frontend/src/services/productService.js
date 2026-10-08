import axiosInstance from './axiosInstance';

export const productService = {
  getMyProducts: () => axiosInstance.get('/farmer/products'),
  createProduct: (formData) => axiosInstance.post('/farmer/products', formData),
  updateProduct: (id, formData) => axiosInstance.put(`/farmer/products/${id}`, formData),
  updateStock: (id, quantityAvailable) => axiosInstance.patch(`/farmer/products/${id}/stock`, { quantityAvailable }),
  updateStatus: (id, active) => axiosInstance.patch(`/farmer/products/${id}/status`, { active }),
  deleteProduct: (id) => axiosInstance.delete(`/farmer/products/${id}`),
  getPublicProducts: (params) => axiosInstance.get('/products', { params }),
  getPublicProduct: (id) => axiosInstance.get(`/products/${id}`)
};
