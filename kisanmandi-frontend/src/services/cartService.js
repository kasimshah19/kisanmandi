import axiosInstance from './axiosInstance';

// Customer cart operations
export const cartService = {
  get:       ()              => axiosInstance.get('/customer/cart'),
  add:       (productId, quantity) => axiosInstance.post('/customer/cart', { productId, quantity }),
  update:    (itemId, quantity)    => axiosInstance.put(`/customer/cart/${itemId}`, { quantity }),
  remove:    (itemId)        => axiosInstance.delete(`/customer/cart/${itemId}`),
  clear:     ()              => axiosInstance.delete('/customer/cart'),
};
