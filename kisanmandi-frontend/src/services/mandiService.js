import axiosInstance from './axiosInstance';

const cleanParams = (params) => {
  const cleaned = {};
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      cleaned[key] = params[key];
    }
  });
  return cleaned;
};

export const mandiService = {
  getStates: () => axiosInstance.get('/mandi/states'),
  getDistricts: (state) => axiosInstance.get('/mandi/districts', { params: { state } }),
  getMarkets: (state, district) => axiosInstance.get('/mandi/markets', { params: { state, district } }),
  getCommodities: (state, district, market) => axiosInstance.get('/mandi/commodities', { params: cleanParams({ state, district, market }) }),
  getLatestDate: () => axiosInstance.get('/mandi/latest-date'),
  getPrices: (params) => axiosInstance.get('/mandi/prices', { params: cleanParams(params) }),
  getTrend: (params) => axiosInstance.get('/mandi/trend', { params: cleanParams(params) }),
  getCompare: (params) => axiosInstance.get('/mandi/compare', { params: cleanParams(params) }),
  getSummary: (params) => axiosInstance.get('/mandi/summary', { params: cleanParams(params) }),
  getStatus: () => axiosInstance.get('/mandi/status')
};
