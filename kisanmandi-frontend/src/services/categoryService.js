import axiosInstance from './axiosInstance';

export const categoryService = {
  getCategories: () => axiosInstance.get('/categories')
};
