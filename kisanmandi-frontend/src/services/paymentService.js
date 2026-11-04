import axiosInstance from './axiosInstance';

export const verifyPayment = async (paymentData) => {
  const response = await axiosInstance.post('/customer/payments/verify', paymentData);
  return response.data;
};

export const retryPayment = async (paymentGroupId) => {
  const response = await axiosInstance.post(`/customer/payments/${paymentGroupId}/retry`);
  return response.data;
};

export const cancelPaymentGroup = async (paymentGroupId) => {
  const response = await axiosInstance.post(`/customer/payments/${paymentGroupId}/cancel`);
  return response.data;
};

// Legacy fallback
export const createPaymentOrder = async (orderId) => {
  const response = await axiosInstance.post('/payment/create-order', { orderId });
  return response.data;
};

export default {
  verifyPayment,
  retryPayment,
  cancelPaymentGroup,
  createPaymentOrder,
};
