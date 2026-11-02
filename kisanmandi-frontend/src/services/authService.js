import axiosInstance from './axiosInstance';

// Register a new user (FARMER or CUSTOMER)
export const register = async (data) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

// Login and get JWT token + user info (sets httpOnly refresh cookie)
export const login = async (data) => {
  const response = await axiosInstance.post('/auth/login', data);
  return response.data;
};

// Refresh access token via httpOnly cookie
export const refresh = async () => {
  const response = await axiosInstance.post('/auth/refresh');
  return response.data;
};

// Get the currently logged-in user's profile
export const getMe = async () => {
  const response = await axiosInstance.get('/auth/me');
  return response.data;
};

// Request a password reset link
export const forgotPassword = async (email) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

// Reset password with token
export const resetPassword = async (token, newPassword) => {
  const response = await axiosInstance.post('/auth/reset-password', { token, newPassword });
  return response.data;
};

// Change password for logged-in user (PUT /auth/password)
export const changePassword = async (currentPassword, newPassword) => {
  const response = await axiosInstance.put('/auth/password', { currentPassword, newPassword });
  return response.data;
};

// Verify email with token
export const verifyEmail = async (token) => {
  const response = await axiosInstance.post('/auth/verify-email', { token });
  return response.data;
};

// Resend email verification link
export const resendVerification = async () => {
  const response = await axiosInstance.post('/auth/resend-verification');
  return response.data;
};

// Logout current session (revokes refresh token family and clears cookie)
export const logout = async () => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch {
    // Ignore error if server unreachable or already expired
  }
};

// Logout from all devices (increments tokenVersion and revokes all refresh tokens)
export const logoutAll = async () => {
  const response = await axiosInstance.post('/auth/logout-all');
  return response.data;
};
