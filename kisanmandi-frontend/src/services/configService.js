import axiosInstance from './axiosInstance';

export const getPublicConfig = async () => {
  const response = await axiosInstance.get('/config/public');
  return response.data;
};

export default {
  getPublicConfig,
};
