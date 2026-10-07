import axiosInstance from './axiosInstance';

export const checkHealth = async () => {
  const response = await axiosInstance.get('/health');
  return response.data;
};
