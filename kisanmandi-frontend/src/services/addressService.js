import axiosInstance from './axiosInstance';

// Customer address CRUD operations
export const addressService = {
  getAll:      ()           => axiosInstance.get('/customer/addresses'),
  create:      (data)       => axiosInstance.post('/customer/addresses', data),
  update:      (id, data)   => axiosInstance.put(`/customer/addresses/${id}`, data),
  remove:      (id)         => axiosInstance.delete(`/customer/addresses/${id}`),
  setDefault:  (id)         => axiosInstance.patch(`/customer/addresses/${id}/default`),
};
