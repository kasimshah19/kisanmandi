import axiosInstance from './axiosInstance';

export const farmerService = {
  getProfile: () => axiosInstance.get('/farmer/profile'),
  saveProfile: (data) => axiosInstance.post('/farmer/profile', data),
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/farmer/profile/document', formData);
  }
};
