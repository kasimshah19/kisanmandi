import axiosInstance from './axiosInstance';

// Register a new user (FARMER or CUSTOMER)
export const register = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

// Login and get JWT token + user info
export const login = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

// Get the currently logged-in user's profile
export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};
