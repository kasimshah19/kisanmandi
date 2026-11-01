import axiosInstance from './axiosInstance';

export const createPaymentOrder = async (orderId) => {
  const response = await axiosInstance.post('/payment/create-order', { orderId });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post('/payment/verify', paymentData);
  return response.data;
};

export default {
  createPaymentOrder,
  verifyPayment,
};
